# Holistic Performance Analysis: next-yak vs styled-components

**Goal:** make next-yak the fastest possible library with a styled-components-compatible API, by making as much static as possible — and prove it with rigorous, reproducible measurements that reflect real users of galaxus.ch (fast initial load on commodity phones, fast soft navigation, fast interactions on product pages).

This document is an idea pool: everything worth measuring, every potential bottleneck worth investigating, every experiment worth building. It is organized so that each section can be turned into a standalone benchmark or investigation. Empirical numbers marked **[measured 2026-06-09]** were taken from this repo on this machine; everything else is a hypothesis with a proposed test.

---

## Table of contents

1. [Why this is not one benchmark but five different races](#1-why-this-is-not-one-benchmark-but-five-different-races)
2. [Cost models: where each library spends time](#2-cost-models)
3. [The three-way baseline principle: always race against the speed of light](#3-three-way-baseline)
4. [Device & environment matrix](#4-device--environment-matrix)
5. [Metric catalog](#5-metric-catalog)
6. [Benchmark scenario catalog (the idea pool)](#6-benchmark-scenario-catalog)
   - A. Initial load
   - B. Hydration
   - C. Soft navigation
   - D. Re-render & dynamic styling micro-benchmarks
   - E. Browser style engine & invalidation experiments
   - F. React scheduling, time slicing & long tasks
   - G. Memory, GC & long sessions
   - H. SSR & server cost
   - I. RSC & bundle composition
7. [JIT & code-shape analysis of the yak runtime after webpack prod builds](#7-jit--code-shape-analysis)
8. [next-yak bottleneck hypotheses (H1–H16)](#8-next-yak-bottleneck-hypotheses)
9. [styled-components weaknesses to expose (fairly)](#9-styled-components-weaknesses)
10. [Methodology & statistical rigor](#10-methodology--statistical-rigor)
11. [Tooling catalog](#11-tooling-catalog)
12. [The galaxus-shaped macro benchmark: "YakShop"](#12-the-galaxus-shaped-macro-benchmark)
13. [Optimization backlog: making more static](#13-optimization-backlog)
14. [Continuous performance in CI](#14-continuous-performance-in-ci)
15. [Prioritized roadmap](#15-prioritized-roadmap)
16. [Appendix: harness sketches & current baseline data](#16-appendix)

---

## 1. Why this is not one benchmark but five different races

"Is next-yak faster than styled-components?" decomposes into five almost-independent races, each with its own winner-determining mechanics:

| Race | Dominant cost | Who pays | When it matters at galaxus |
|---|---|---|---|
| **1. Ship** | bytes → network, parse, compile | every visitor | first visit, cold cache, campaign traffic |
| **2. Boot** | module eval, hydration CPU | every visitor | LCP→TTI gap, TBT, INP on early clicks |
| **3. Navigate** | route JS+CSS fetch, render, style injection | every page switch | PLP → PDP → cart funnel |
| **4. Interact** | re-render cost, style recalc, invalidation | every click/hover/filter | filters, variant pickers, galleries |
| **5. Serve** | SSR CPU per request | the server fleet | infra cost, TTFB under load |

A library can win race 1 and lose race 4 (small bundle, but pathological invalidation), or win race 4 and lose race 3 (fast updates, but route CSS chunk fetch blocks navigation paint). Every scenario below states which race it belongs to. The headline claim "fastest styled-components-compatible library" requires winning or tying **all five**.

---

## 2. Cost models

### 2.1 styled-components (v6) — runtime CSS engine

Per styled component, per render, styled-components must:

1. Evaluate the tagged template: call every interpolation function with `props` (including theme from context — **every** styled component subscribes to ThemeContext).
2. Concatenate the resulting CSS string and hash it (componentId + generated class).
3. On cache miss: parse the CSS with **stylis** (full CSS parser running in the browser), prefix it, and inject rules into the CSSOM via `insertRule` on the "speedy" sheet.
4. On cache hit: look up the existing class.
5. Compose className, render the wrapper component.

Costs that follow from this design:
- **stylis ships to the client** (~13.3 KB gzip total for styled-components + deps **[measured 2026-06-09]**, vs 2.7 KB for yak's runtime, see §2.2).
- Every *new dynamic value* is a *new class*: parse + hash + `insertRule` + style invalidation of every element matching the changed selector.
- The stylesheet **grows monotonically** for the lifetime of the page — dynamic classes are never removed. (Race 4 + Race "memory".)
- SSR requires `ServerStyleSheet` collection and style rehydration on the client (parsing `data-styled` attributes at boot — Race 2).
- Everything must be a Client Component in App Router (`"use client"`), which inflates the hydration tree and RSC payload (Race 1, 2).

### 2.2 next-yak — compile-time extraction + minimal runtime

The SWC plugin moves work to the build:
- Static CSS → CSS Modules (webpack/turbopack) or virtual CSS modules (Vite). Classed at build time, served as `.css`.
- Dynamic interpolations → **CSS custom properties** set via inline `style` (`--yakVar…: fn(props)`), with the extracted CSS referencing `var(--yakVar…)`.
- Conditional `css` blocks → **class toggles** decided at runtime by tiny compiled functions.

The entire client runtime minifies to **6,774 B / 2,749 B gzip** (esbuild, externals: react) **[measured 2026-06-09]**. styled-components 6.4.1 browser ESM with its runtime deps (stylis, @emotion/is-prop-valid, etc.): **33,652 B / 13,279 B gzip**. That's a ~10.5 KB gzip head start in Race 1 — before counting the `"use client"` blast radius.

But the runtime is not zero. The actual per-render path (from the minified output of `packages/next-yak/dist/internal.js`; source: `packages/next-yak/runtime/styled.tsx:82-165`) does, **per element, per render**:

1. Conditionally read theme context (only if attrs or dynamic styles exist — good).
2. Spread incoming props into a new object (`{theme, ...props}`), possibly twice when attrs are present (`combineProps`).
3. Allocate a `new Set()` from `className.split(" ")`.
4. Spread the incoming `style` object into a fresh object.
5. Run the compiled style processor (mutates the Set + style object).
6. `Array.from(set).join(" ")` → className string.
7. Rest-destructure to strip `theme` (another object copy).
8. For intrinsic elements: iterate **all** props to filter `$`-prefixed ones (`startsWith("$")` per key) into yet another object.
9. `React.createElement(tag, {...props})` — one more spread.

That is roughly **5–7 object allocations + 1 Set + 1 array + string ops per element per render, even for a fully static `styled.div`**. This is the gap between next-yak and the speed of light (§3) and the main target of §13.

### 2.3 The crucial asymmetry

- styled-components' dynamic-prop cost is **per distinct value** (class cache miss → stylis + CSSOM + selector invalidation).
- next-yak's dynamic-prop cost is **per update** (inline style custom property write → **inherited-property invalidation of the whole descendant subtree**, see §6.E and the Chromium issue class the user referenced, [issues.chromium.org/issues/342214592](https://issues.chromium.org/issues/342214592)).

So for a value that animates through many distinct values (slider, scroll-linked, color picker), yak should win massively. For a value that toggles between two cached values on an element with 5,000 descendants, styled-components' cached class swap may actually invalidate *less* (class invalidation is targeted by invalidation sets; inherited custom property changes are not). **This asymmetry is the single most important thing to measure** — it decides the guidance we give users ("toggles → idiomatic class toggles, continuous values → CSS vars") and motivates compiler optimizations (§13: `@property inherits:false`, leaf-scoped vars).

---

## 3. Three-way baseline

Every benchmark must run **at least three implementations**, ideally four:

1. **styled-components** (the competitor),
2. **next-yak** (us),
3. **hand-written CSS Modules + plain JSX** (the speed of light: `<div className={s.x} style={{"--w": w}}>`),
4. *(optional)* **next-yak idiomatic** (class toggles instead of CSS vars where applicable).

Reporting only yak-vs-sc hides the question that actually drives the roadmap: *how much of the remaining gap to optimum is yak's runtime, and can the compiler close it?* If yak is 3× faster than sc but 2× slower than CSS Modules, Race 4 is not won — it's outsourced. The existing `benchmarks/` suite should grow a `vanilla` variant in every `gen.ts`.

Where relevant add a fifth lane: **inline style directly** (no custom property indirection) — to isolate the cost of `var()` resolution + inheritance from the cost of setting inline styles at all.

---

## 4. Device & environment matrix

galaxus.ch is Swiss e-commerce: heavy iPhone share (WebKit!), plus mid/low Android, plus desktop. Benchmarking only in desktop Blink would systematically mislead us — Blink, WebKit and Gecko have **different style invalidation engines**, and the custom-property story differs per engine.

### 4.1 Device classes

| Class | Representative real devices | Lab emulation | Why |
|---|---|---|---|
| Low-tier Android | Samsung Galaxy A14/A05, Moto G Play, Redmi 9A | Chrome DevTools/Lighthouse **~6× CPU throttle**, 4 cores | worst-case TBT/INP; campaign traffic; the device where 50 ms of JS becomes 300 ms |
| Most-used mid phones | iPhone 12/13/SE3, Pixel 6a/7a, Galaxy S21 FE/A54 | ~4× throttle; **real iPhone via Safari/WebDriver is mandatory** | median user; WebKit style engine coverage |
| High-end phone | iPhone 15/16 Pro | 1–2× | sanity check; thermal throttling tests |
| Laptops | M1/M2 MacBook Air, mid Windows i5 + integrated GPU | no throttle / 2× on Windows | desktop conversion traffic; dev perception |

Calibrate throttling instead of guessing: run a fixed JS workload (e.g., Speedometer 3 subset or our own hydration benchmark) on the real device and on the throttled desktop, and pick the multiplier that matches — Lighthouse's calibration methodology, applied to our suite. Re-calibrate per benchmark machine.

### 4.2 Engines

- **Blink** (Chrome/Android): invalidation sets, `disabled-by-default-devtools.timeline.invalidationTracking` tracing, Selector Stats — our most instrumentable engine.
- **WebKit** (iOS — *all* iOS browsers): different custom-property invalidation, different CSSOM `insertRule` costs, no Blink tracing. Measure via user timing + `PerformanceObserver` + Safari Web Inspector timelines on a real device.
- **Gecko** (Firefox): Stylo is parallel; class-change invalidation behaves differently; useful as a third opinion that catches Blink-specific conclusions.

### 4.3 Network profiles

- Cold first visit: 4G (9 Mbps / 170 ms RTT) and slow 4G/fast 3G (1.6 Mbps / 150–300 ms RTT).
- Warm repeat visit: full HTTP cache, validate-only — this is where shipping CSS files (cacheable, content-hashed, unchanged across deploys more often than JS) can beat CSS-in-JS (cache-busted whenever any JS in the chunk changes). **Measure cache survival across a simulated deploy**: change one component, rebuild, diff which assets re-download for each library. CSS-in-JS couples style bytes to JS chunk hashes; extracted CSS decouples them.
- Soft navigation with cold route chunks vs prefetched route chunks (Next.js `<Link>` prefetch on/off).

### 4.4 Environment hygiene

Pinned: Chrome version, Node version, Next.js version (test both webpack and Turbopack builds — yak supports both and the output shape differs), React version (19.x in this repo), `NODE_ENV=production`, no extensions, fresh profile per run, mains power, fans-settled M-series or fixed-frequency Linux box (disable turbo: `intel_pstate=passive`, governor `performance`), screen on, no other processes. Phones: airplane mode + USB ADB, fixed brightness, cooldown intervals between runs (thermal state is the #1 source of mobile variance — consider reading `adb shell dumpsys thermalservice` between runs and discarding hot runs).

---

## 5. Metric catalog

### 5.1 Loading (Race 1)

- Bytes: total JS (raw/gzip/brotli), total CSS, **per-route** JS+CSS, shared-chunk composition (`next build` output + `webpack-bundle-analyzer` / `next-bundle-analyzer`).
- Request count & waterfall shape; render-blocking CSS bytes; whether App Router inlines or links route CSS.
- **Compression interaction**: CSS-in-JS embeds CSS strings inside JS — measure how much worse template-literal CSS compresses inside a JS bundle vs the same rules in a `.css` file (brotli loves CSS's repetitive structure; JS string escapes and interleaving hurt it). Concrete test: 200-component app, compare brotli'd bytes of (sc JS bundle) vs (yak JS bundle + yak CSS file).
- V8 parse+compile time of each bundle: trace categories `v8.compile`, `disabled-by-default-v8.compile`; also `performance.measure` around script evaluation; Lighthouse "Script Evaluation" breakdown.
- CSS parse time: Blink "Parse Stylesheet" trace events for yak's CSS files vs sc's runtime stylis parsing ("Evaluate Script" hides it — use CPU profile attribution to stylis frames).

### 5.2 Boot & hydration (Race 2)

- Module-eval time of the styling library graph specifically (CPU profile, attribute self-time to `node_modules/styled-components/**` vs `next-yak/dist/internal.js` frames).
- **Hydration duration**: `performance.mark` before `hydrateRoot`, then measure to the end of the synchronous hydration commit (first task end via LoAF / a `useEffect` in the root). Break out: per-1000-styled-components hydration cost. styled-components additionally pays **style rehydration** (reading `<style data-styled>` text, re-registering componentIds) — isolate it by profiling `rehydrate`-related frames.
- TBT, Long Tasks ≥50 ms, **Long Animation Frames (LoAF)** with script attribution during boot.
- INP of the *first* interaction landing during/just after hydration (the classic "rage click on a filter at 2 s" scenario) — script a click at fixed timestamps post-FCP and record Event Timing.

### 5.3 Interaction & rendering (Race 4)

- React commit durations: `<Profiler onRender>` (actualDuration, baseDuration) around the scenario subtree; React DevTools profiler traces for flame-diffing.
- **Style recalculation**: count + duration of "Recalculate Style" trace events, *and* the invalidation tracking detail: how many elements were invalidated, by what (class change vs inline style change vs custom property). Trace categories: `disabled-by-default-devtools.timeline.invalidationTracking`, `blink,blink_style`.
- Layout count/duration; forced synchronous layouts; paint + composite durations (does the change stay paint-only — `color: var(--x)` — or trigger layout — `width: var(--x)`?).
- `insertRule` activity: count of CSSOM mutations per interaction (CDP `CSS.styleSheetChanged` or count rules before/after).
- Frame timing during 60 fps prop animation: dropped frames, p95 frame duration (`requestAnimationFrame` deltas or DevTools FPS trace).
- Event Timing / INP for discrete interactions (filter toggle, variant select), with LoAF attribution to see whether the time goes to React render, style recalc, or layout.

### 5.4 Style engine state

- Total CSS rules in CSSOM over time (page lifetime, SPA session) — `[...document.styleSheets].reduce((n,s)=>n+s.cssRules.length,0)`.
- Selector Stats (Chrome DevTools performance panel → "Selector statistics"): which selectors are slow to match, % of match attempts wasted — compare yak's CSS-Modules output (flat class selectors, but possibly more rules due to emitted-but-unused conditional branches) vs sc's runtime sheet.
- Stylesheet memory (`performance.measureUserAgentSpecificMemory`, heap snapshot `CSSStyleSheet` retained size).

### 5.5 Memory & GC

- Allocation rate during steady-state re-render (Chrome Allocation sampling profiler; `--trace-gc` in Node for SSR).
- Minor/major GC counts and pause totals during a 10 s interaction loop (trace category `v8.gc` / `disabled-by-default-v8.gc`).
- Heap growth over a scripted 50-page SPA journey; detached nodes; sc's ever-growing style sheet & componentId caches vs yak's static CSS.

### 5.6 Server (Race 5)

- `renderToString` ops/sec (existing `benchmarks/` suite — keep it, it's good).
- **Streaming**: `renderToPipeableStream` time-to-first-byte and total render time — sc needs `interleaveWithNodeStream`, yak needs nothing; measure both the happy path and the sc-without-sheet misconfiguration (common in the wild).
- Per-request allocations and GC pauses under load (`node --cpu-prof`, `--heap-prof`, clinic.js flame); p99 latency under concurrency (autocannon against a minimal Next standalone server).
- RSC payload size for the same page (yak components can stay server components; sc forces client).

---

## 6. Benchmark scenario catalog

Each scenario lists: **what**, **why**, **how**, **metrics**, and the **race** it informs. All scenarios run the 3–4 way comparison of §3 across the device matrix of §4 unless stated.

### A. Initial load (Race 1)

**A1. Component-count scaling curve.** Generate apps with 50 / 200 / 800 / 2000 distinct styled components (realistic galaxus scale: a design system + features easily exceeds 1000). Measure bundle bytes, parse/compile time, FCP/LCP/TBT. *Hypothesis:* sc cost grows per component (template strings + interpolation closures in JS); yak JS grows slower (class string + tiny processor) but CSS grows linearly — find the crossover where CSS bytes hurt (render-blocking) more than JS bytes (post-LCP).

**A2. CSS placement & render blocking.** yak's CSS is render-blocking by default (good for no-FOUC, bad if huge). Measure LCP sensitivity to total CSS size; test App Router behavior (inlined vs `<link>`), HTTP/2 prioritization, and whether splitting CSS per route keeps the critical sheet small. Compare against sc's "styles arrive with JS" model where first paint needs zero CSS bytes but full JS.

**A3. Dead branch CSS bloat.** yak emits **all** conditional `css` branches at build time, even those a given page never renders; sc only injects what renders. Build a component with 10 variants where pages use 1. Measure shipped CSS overhead, CSSOM rule count, selector-matching overhead (Selector Stats). This is an honest yak weakness — quantify it to motivate per-route CSS tree shaking (§13).

**A4. Cache economics across deploys.** Simulate 5 successive deploys each touching 2% of components. Measure bytes re-downloaded per deploy per library (content-hashed CSS often survives; sc's CSS lives in JS chunks that re-hash). Repeat-visit LCP is a galaxus KPI.

**A5. Compression deep dive.** As described in §5.1 — same rules as `.css` vs embedded in JS, brotli level 5 and 11.

### B. Hydration (Race 2)

**B1. Hydration scaling curve.** SSR'd page with N styled elements (N = 500 / 2000 / 8000 — a galaxus PLP with 60 product cards × ~30 styled elements ≈ 2000+). Measure hydration task duration on 6× throttle. Per-element hydration cost = slope of the curve. *Mechanics to verify:* during hydration React still **executes every component function** — so yak's per-render allocations (§2.2) and sc's full template evaluation + class hashing both run for every element; sc additionally rehydrates its server style tags. Expect yak to win; quantify by how much, and how far yak is from the CSS-Modules baseline.

**B2. Style rehydration isolation.** Profile sc's boot with CPU sampling and attribute self-time to its rehydration path separately from React hydration, so we can say "X ms of sc's boot is style bookkeeping, not React".

**B3. Selective hydration / Suspense.** Page with 4 suspense boundaries; measure whether styling runtime changes the order/latency of selective hydration and INP of clicking a not-yet-hydrated region (replay semantics). Also: does sc's style injection during late-hydrating boundaries cause visible style pop-in or recalc storms?

**B4. First-interaction INP during boot.** Scripted tap on the search input / filter at FCP+500 ms, FCP+1500 ms. Event Timing + LoAF attribution. This is the metric galaxus users feel most.

**B5. React 19 / concurrent hydration interplay.** Hydration is sync per boundary; long boundaries = long tasks. Measure max task length as a function of styled-element count per boundary — informs guidance on boundary granularity, and tests whether yak's smaller per-element cost lets more elements fit under 50 ms.

### C. Soft navigation (Race 3)

**C1. PLP → PDP client navigation.** Two realistic routes; `router.push` on click. Measure: time from click (Event Timing processingStart) to next paint of the new route (double-rAF after commit, or the experimental soft-navigation heuristic `PerformanceObserver({type:'soft-navigation'})` in Chrome). Variants: route chunk warm vs cold; CSS chunk warm vs cold; `<Link prefetch>` on/off.
*Key risk for yak:* the destination's CSS chunk is a **separate fetch** that can gate the paint, while sc has styles inside the JS chunk it must fetch anyway. Quantify the delta and the mitigation value of prefetch.
*Key risk for sc:* on first navigation to a route, **every new component injects rules** — a burst of stylis parses + `insertRule` calls + style invalidations on an already-large document. Count "Recalculate Style" events and CSSOM mutations during nav.

**C2. Back/forward (bfcache-less SPA back).** PDP → back to PLP with 60 cards. sc has all classes cached now (best case for sc) — this measures pure re-render + reconciliation, i.e., the runtime overhead head-to-head with warm caches. Most honest steady-state React benchmark.

**C3. Navigation under load.** Trigger navigation while a CSS-var-driven animation runs (e.g., a marquee/carousel). Does either library's work fragment the navigation's render into more main-thread chunks?

**C4. 20-navigation journey.** PLP→PDP×10 alternating. Watch: sc stylesheet rule count growth (never shrinks), recalc durations trending up as the sheet grows (selector matching is roughly O(rules×elements) bounded by bloom filters/invalidation sets — verify whether *growing sheets make later navigations slower*), heap growth. yak should be flat. Plot metric-vs-navigation-index.

### D. Re-render & dynamic styling micro-benchmarks (Race 4)

**D1. The continuous-value sweep.** One component, prop animated through 600 distinct values in 10 s (slider drag, scroll progress bar, color picker):
- sc: 600 cache misses → 600 stylis parses + 600 new rules + invalidations; sheet +600 rules.
- yak: 600 inline custom-property writes.
- baseline: 600 direct inline `style.width` writes.
Metrics: frame durations, recalc time per frame, dropped frames, CSSOM rule count after. *Expected: yak wins by an order of magnitude; get the number on a low-tier phone.*

**D2. The two-state toggle.** Same component toggling between exactly two values at 10 Hz (hover-like, selected-state-like). Now sc has cached classes (cheap class swap) while yak writes a custom property. Compare against yak-idiomatic (compiled class toggle) and baseline. *This is where yak's CSS-var path can lose; the result decides how aggressively the compiler should prefer class toggles (§13).*

**D3. Descendant-count sensitivity (the invalidation cliff).** Toggle/animate a dynamic prop on a container with 0 / 100 / 1,000 / 10,000 descendants:
- yak (custom property on container): inherited property change → style invalidation of the **entire subtree** (the Blink behavior class referenced by [crbug 342214592](https://issues.chromium.org/issues/342214592)).
- sc (class swap on container): invalidation-set-targeted — only elements matching affected selectors.
- variants: descendants *use* the var vs don't; var registered via `@property … inherits: false`; var set on a leaf instead.
Metrics: "Recalculate Style" duration + invalidated-element count (invalidation tracking trace) per engine (Blink/WebKit/Gecko — engines differ here, measure all three). **This experiment alone defines yak's biggest runtime-perf guidance and the §13 `@property` work.**

**D4. List re-render storm.** 1,000-row product list; update one shared prop (e.g., "compact mode") so all rows re-render. Profiler actualDuration, GC activity, recalc. Tests per-element runtime cost at scale (yak's Set/spread allocations vs sc's template evaluation).

**D5. Single-item update in a big list.** Change one row out of 1,000 (memoized rows). Verifies neither library breaks memoization (sc theme context? yak props identity?) and measures the *isolated* item cost.

**D6. Theme switch.** Toggle dark mode via ThemeProvider: sc re-renders **every styled component** (context) and generates a parallel set of classes (sheet doubles); yak re-renders consumers too (context) — and compare with the CSS-variable theming pattern (zero React re-render, pure recalc). Measure total blocking time of the switch on 6× throttle. Also informs docs: yak + CSS var themes = optimum.

**D7. `attrs`, `as`, `css` prop overheads.** Micro-bench each API affordance separately (the existing bench suite covers attrs/css-prop on SSR; add client-render and update variants). Measure the closure-chain cost of stacked `.attrs()` (yak `combineProps`/`mergedAttrsFn` chains vs sc's array of attrs).

**D8. Composition depth.** `styled(styled(styled(Base)))` 5 levels deep ×200 instances (the existing nested bench, but client-side updates): yak chains processors (`W(_,r)` composition in the minified runtime) — linear in depth per render; sc concatenates componentIds. Find where deep design-system composition gets expensive.

**D9. Keyframes / animation start.** Mount 200 elements with keyframe animations: sc injects @keyframes at mount (parse + insert); yak's are in the static sheet. Measure mount commit + recalc + animation start latency.

**D10. Transitions vs class churn.** Verify visual correctness-performance interplay: with sc, a new generated class on value change replaces the old class — confirm CSS transitions still fire (they do, same element) but measure the extra recalc; with yak, var changes animate via `transition` on the property that consumes the var. Also test `transition: --x` (registered custom properties are transitionable) as a yak-only superpower.

### E. Browser style engine & invalidation experiments (Race 4, engine-level)

These are POC pages, not React benchmarks — pure DOM + CSS to isolate engine behavior. Build once, run in all three engines.

**E1. Inherited custom property invalidation scope.** `div#root` with M descendants; toggle `--x` on root via inline style. Measure recalc duration vs M, with 0%/10%/100% of descendants referencing `var(--x)`. Compare Blink's behavior (descendant invalidation regardless of usage? Blink has optimizations to skip subtrees without var references — verify empirically, don't trust docs) vs WebKit vs Gecko. Then repeat with `@property { inherits: false }` — if recalc becomes O(1)-ish, the compiler should emit `@property` rules for every yak variable that isn't intentionally inherited (§13). **This is the highest-leverage engine experiment in this document.**

**E2. Class-change invalidation scope.** Toggle a class on the same root where the stylesheet contains (a) `.x { color: red }` (self only), (b) `.x .child {…}` (descendant invalidation set). Quantifies what sc's class swap actually invalidates, and what yak's idiomatic toggles cost when fixtures generate nested selectors (`& .child`).

**E3. `insertRule` cost curve.** Insert 1 / 10 / 100 rules into a sheet that already has 100 / 5,000 / 20,000 rules, with 10,000 elements present. Measures sc's per-new-class tax and whether it grows with sheet size (rule indexing rebuild) — directly explains C4 results.

**E4. Selector matching at scale.** Load yak's generated CSS for the 2,000-component app (A1) into a static page with a galaxus-shaped DOM (~3,000 elements) and measure initial style resolution + Selector Stats; same for an sc-equivalent sheet captured after rendering. Tests whether emitted-but-unused rules (A3) cost match time or only bytes.

**E5. Inline style write vs custom property write.** Same element, write `style.width = x+'px'` vs `style.setProperty('--w', x)` (with `width: var(--w)` in CSS) at 60 fps. Isolates the var-indirection overhead (recalc must resolve var refs; inherited registration; potential `StyleAttr` invalidation differences). Informs §13 "skip the var when the target property is on the same element".

**E6. `contain: style/layout` and `content-visibility` as mitigations.** Re-run D3 with `contain: layout style` on cards and `content-visibility: auto` on below-fold sections. If containment caps invalidation cost, yak docs should recommend it for card grids; possibly the compiler can even emit it.

**E7. Style recalc vs the rest of the pipeline.** For each interaction scenario, decompose frame time: Recalculate Style / Layout / Pre-Paint / Paint / Commit. A library can shift cost between stages (var change → paint-only if property is paint-only; class swap adding `width` → layout). Catalog which galaxus-typical properties (color, background, border, transform, width, padding) land where for each library's update mechanism.

### F. React scheduling, time slicing & long tasks (Race 2+4)

React's concurrent scheduler yields roughly every 5 ms of work (the often-quoted ~8 ms budget per slice including overhead); sync renders (discrete events, hydration within a boundary) don't yield at all.

**F1. Unit-of-work inflation.** Per-fiber cost includes the styled wrapper's render. Measure fibers-processed-per-slice during a `startTransition` render of 5,000 elements for each library (React Profiler + scheduler profiling track in React DevTools / `react` profiling build). Heavier per-fiber work ⇒ fewer fibers per slice ⇒ more scheduler overhead and longer total transition latency. Also measure: total slices, total transition duration, main-thread availability for input during the transition (synthetic pointermove latency).

**F2. Sync-render long tasks.** Same 5,000-element render triggered by a click (sync, no yielding): single task length per library on 6× throttle — this *is* INP. Find the element count where each library crosses 200 ms (INP "poor") — "yak lets you render 2.3× more product cards inside an INP-safe task" is a headline-able result.

**F3. `useInsertionEffect` cost.** sc v6 uses insertion effects for dynamic rules; they run synchronously in the commit phase before layout effects. Measure commit-phase duration share. yak has none — verify via profiler that yak commits are pure mutation.

**F4. Scheduler interplay with style work.** When sc injects rules mid-transition (new components appear in a slice), the browser may recalc between slices (rAF boundary). Count recalc events *during* a sliced transition for both libraries — style work multiplying per-slice instead of once per update would be a notable sc pathology (and an argument for yak's "all CSS already present" model).

**F5. React Compiler interplay.** With the React Compiler enabled (galaxus-relevant future): does auto-memoization help yak (props objects often freshly spread — check whether compiler memo survives) and sc equally? Measure D4/D5 with compiler on/off.

### G. Memory, GC & long sessions (Race 4 + stability)

**G1. Allocation per render audit.** Chrome allocation-sampling during D4: bytes allocated per 1,000-element commit, per library, vs baseline. Attribute to call sites (expect yak: `Set`, spreads, `Array.from`; sc: css string concat, arrays, style objects). Feeds §13 directly.

**G2. GC pauses during interaction.** 30 s of D1 at 60 fps: count minor GCs, total GC time (trace `v8.gc`). On low-tier devices minor GC pauses cause dropped frames even when scripting fits the frame.

**G3. The 50-page session.** Scripted journey: 50 PLP↔PDP navigations + filters + gallery interactions. Snapshot every 10 navs: JS heap, CSSOM rules, style element count, detached DOM. sc's monotonic sheet + componentId/style caches vs yak flatline. E-commerce sessions are long; this is a real galaxus concern.

**G4. SSR server memory.** Sustained 200 rps for 5 min on the bench server: RSS, heap, GC time share per library (sc allocates a `ServerStyleSheet` + css strings per request).

### H. SSR & server cost (Race 5)

**H1. Keep & extend the existing suite** (`benchmarks/bench/index.bench.tsx`): it already covers kanji-letter, 1000 pure components, attrs, css-prop, dynamic vs idiomatic-dynamic, nested, tree, sierpinski, cross-request cache, deep/wide trees, and SSR extraction. Add: the vanilla CSS-Modules lane (§3), streaming (`renderToPipeableStream`) variants, and a "realistic mixed page" composite.

**H2. Latency distribution under concurrency**, not just ops/sec: p50/p99 with autocannon at 50/200 rps; GC-induced p99 spikes per library.

**H3. RSC rendering.** Pages where yak components are **server components** (no client runtime at all for static parts) vs sc (everything client): measure server render time, RSC payload bytes, and the knock-on client effects (B1 hydration tree size). Arguably yak's biggest structural advantage in App Router — make it a first-class benchmark, not a footnote.

### I. RSC & bundle composition (Race 1+2)

**I1. `"use client"` blast radius.** Take a realistic page and count modules forced into the client bundle solely because sc requires client components (a leaf `styled.div` in a server tree forces the whole subtree client-side unless refactored). Compare client-module count, client JS bytes, hydration fiber count. Express as "KB of application code yak keeps on the server".

**I2. Per-route CSS duplication.** When the same yak component is used by many routes, does the CSS get duplicated across route CSS chunks (webpack `splitChunks` for CSS, Turbopack behavior)? Measure aggregate CSS over all routes vs unique CSS. If duplication is significant → §13 work item.

**I3. Turbopack vs webpack output shape.** yak's DataUrl mode (Turbopack) vs InlineMatchResource (webpack): compare emitted CSS size, dedup, and dev-prod parity. Also benchmark build time at 2,000 components (DX, secondary).

---

## 7. JIT & code-shape analysis

The question: is the small, elegant runtime also in the **best possible state for the JS engine** after Next.js/webpack production compilation? Areas to audit, each with a concrete method:

### 7.1 What actually ships (verify, don't assume)

- Build the benchmark app with `next build --webpack` and locate the yak runtime inside the chunk. Check: did **module concatenation (scope hoisting)** apply, or is the runtime wrapped in webpack module functions with indirection (`__webpack_require__` per import)? ESM with no dynamic patterns should concatenate — verify `optimization.concatenateModules` took effect (`stats.json` → `concatenated modules`).
- Check what Terser/SWC-minifier did vs our esbuild reference (6,774 B): function inlining, sequence expressions (long comma chains can produce worse bytecode than statements — measure, don't guess), `/*#__PURE__*/` annotation effectiveness for the ~170 `styled.div`-style tag exports (`__yak_a` … `__yak_video`): **are unused tag helpers actually tree-shaken in a real Next build?** Each is `a("tagname")` — a call expression; without PURE annotations or `sideEffects:false` taking effect they all survive. Inspect the chunk for `__yak_` survivors. *(Quick check on dist: confirm `package.json` `sideEffects` field and whether tsdown emits PURE comments.)*
- Confirm `process.env.NODE_ENV` branches and dev-only warnings are fully stripped.

### 7.2 Optimization status of hot functions

Run the SSR bench under Node with V8 introspection:

```bash
node --allow-natives-syntax bench-probe.mjs   # %GetOptimizationStatus(fn) after warmup
node --trace-opt --trace-deopt --trace-ic bench.mjs > v8.log
# analyze v8.log with Deopt Explorer (vscode-deoptexplorer) or v8-deopt-viewer
```

Questions to answer for the hot path (`p(k)` — the per-render closure; `T`'s returned processor; `E` recursion; `m` combineProps; `G` $-prop filter):

- Do they reach TurboFan and **stay** optimized, or deopt-loop? Common deopt sources to look for: `arguments`-style spreads, changing object shapes, `in` checks on dictionary-mode objects.
- **Inline cache states**: the single shared `p` function renders *every* yak component → its property accesses (`k.className`, `k.style`, `k.theme`, the `for in` over props) see a different props shape per component → **megamorphic ICs are near-guaranteed**. Measure the real cost: compare a build where each component gets its own generated render function (monomorphic per call site) vs the shared runtime — a compiler-emits-specialized-code experiment (§13). sc has the same problem (one `styled` render path for all), so relative impact may wash out — but vs the CSS-Modules baseline it won't.
- **Hidden class hygiene of the styles object**: `g = {...style}` then assigning computed keys `g["--yakVarX"]=…` — varying key sets per component push objects toward dictionary mode. Check `%HasFastProperties` on representative style objects. Alternative shapes to test: always pre-create keys (compiler knows them statically!), or emit an array of `[key, value]` pairs applied directly.
- The `Set` usage: `new Set(split)`, `add`, `Array.from(set).join(" ")`. V8 Sets are fine but allocation-heavy for 1–3 entries. Benchmark alternative: plain string concat with a compiler-guaranteed-no-duplicate invariant (the compiler knows all classes it emits — dedupe at build time, drop the Set entirely). Microbench: Set path vs string concat for 1/3/6 classes, 1M iterations, plus allocation profile.
- `"$__attrs" in k` and `"className" in y` — `in` on spread-created objects is shape-dependent; check IC state.
- `G` (the $-prop filter) iterates **all** props with `startsWith("$")` per key for every intrinsic element render. The compiler knows the `$props` statically at each call site — it could emit an explicit exclusion list or rename props at compile time, removing the loop. Microbench the loop cost at 5/15/30 props.

### 7.3 Parse/compile-time of the runtime

- Trivially small (6.7 KB) — but verify it doesn't end up duplicated in multiple chunks (webpack `splitChunks` decisions); duplicate inclusion would multiply parse cost and bytes.
- Trace `v8.compile` during boot: is the runtime compiled lazily-then-fully (functions invoked during first render get eagerly compiled — fine) and does it stay in Maglev or reach TurboFan during hydration of 2,000 elements? On a 6× throttled device, tier-up time is non-trivial; smaller, fewer, monomorphic functions tier up faster.
- Compare against sc: 33.6 KB + stylis means more bytecode, more lazy compile during first render, more IC warmup. Quantify with Runtime Call Stats (`--runtime-call-stats` in Node / `v8.runtime_stats` tracing in Chrome): buckets `Compile*`, `Parse*`, `IC_*`, per library, during boot.

### 7.4 Allocation shape of one render (cross-link G1)

From the minified path, per element render today: `{theme,...k}` (+1), maybe `m()` result (+1–2), `Set` (+1) + `split` array (+1), `{...style}` (+1), `Array.from` (+1), rest-destructure `{theme:C,...j}` (+1), `G()` filtered object (+1), `createElement({...N})` (+1). ≈ **8–9 allocations per element per render**, even fully static. The CSS-Modules baseline does ≈1 (the props object React creates anyway). This is the concrete, fixable gap behind every client-side benchmark above — see §13 items 1–4.

---

## 8. next-yak bottleneck hypotheses

Each: hypothesis → experiment that confirms/refutes → fix direction.

- **H1. Inherited custom-property invalidation makes dynamic props O(subtree).** → D3/E1 → `@property inherits:false` emission; leaf-scoping; doc guidance.
- **H2. Per-render allocations (Set/spreads/filter) dominate the gap to CSS Modules.** → G1 + 7.4 microbenches → compiler-specialized render paths; string concat classNames; static prop filtering.
- **H3. Fully static components still pay the whole runtime wrapper.** → D4 with 100% static components vs baseline → compile `styled.div` with no dynamics/attrs to a plain element with className (zero-wrapper output, biggest possible win; needs `as`/ref semantics analysis).
- **H4. Soft-nav paint gated on route CSS chunk fetch.** → C1 cold-CSS variant → ensure prefetch covers CSS; consider inlining small route CSS into RSC payload.
- **H5. Dead conditional branches bloat CSS and CSSOM.** → A3/E4 → build-time usage analysis or route-level CSS shaking.
- **H6. Megamorphic shared render function leaves 10–30% on the table.** → 7.2 IC analysis + specialized-codegen prototype → per-component generated functions (bytes vs speed tradeoff — measure both).
- **H7. `combineProps`/attrs chains allocate per render even when attrs are static.** → D7 → precompute static attrs at compile time; only chain for function attrs.
- **H8. `useTheme()` context read on every dynamic component causes context-churn re-renders.** → D6 → document CSS-var theming; consider theme-snapshot via RSC.
- **H9. `unitPostFix` wrapper adds a closure + recursion per dynamic value.** → microbench → compile the unit into the var consumer (`width: calc(var(--x) * 1px)`) — zero runtime.
- **H10. CSS Modules class merging produces long className strings** (multiple classes per element after composition) → check serialized HTML size on the PLP (SSR bytes! every card repeats class strings) → shorter prod hashes; dedupe at compile time. Measure HTML document size yak vs sc vs baseline — sc's generated class names are short; yak's `yak_Button_a1b2c3` style names are long and repeated thousands of times in SSR HTML. Gzip mitigates; measure post-gzip anyway.
- **H11. `style` object always assigned (`y.style=g`) even when empty** → React diffs an empty object per element? Check: does the runtime set `style: {}` on static components (extra prop, extra diff work)? Read output: `y.style=g` unconditionally — confirm and fix (omit when empty).
- **H12. Mutating the props object (`y.$__runtimeStylesProcessed=!0`)** transitions hidden classes and may leak the marker into DOM-prop filtering paths → check IC effects + React warnings → use a WeakSet or compile-time guarantee instead.
- **H13. Cross-file constant resolution increases build-time but also may duplicate CSS** (same mixin inlined into many files) → measure aggregate CSS dedup ratio (I2).
- **H14. Turbopack DataUrl CSS defeats caching/dedup** (CSS embedded as data URLs?) → I3 → verify production pipeline emits real CSS files.
- **H15. The `css` prop merge helper (`__yak_mergeCssProp`) allocates Sets/objects per element per render** → same fix family as H2.
- **H16. SSR `renderToString` of huge classNames + style objects is slower than sc's string pipeline in some shapes** → the existing bench already shows shapes where sc is competitive; investigate any bench where yak doesn't win and attribute precisely (CPU profile the bench).

---

## 9. styled-components weaknesses

For a fair fight, also pre-register the sc pathologies we expect, so results don't look cherry-picked:

- stylis parse + hash on every cache-missed dynamic value (D1).
- `insertRule` bursts on first render of new routes (C1) and the growing-sheet tax (C4, E3).
- ThemeContext subscription on every component → theme switch re-renders the world (D6).
- `ServerStyleSheet` per request + style tag rehydration on boot (B2, H1-server G4).
- Forces `"use client"` → RSC payload + hydration tree inflation (I1).
- 13.3 KB gzip runtime incl. stylis (A-race).
- Per-render tagged-template evaluation: building css strings every render even on cache hits (D4) — allocation churn (G1).
- Known dev-mode costs excluded — all measurements `NODE_ENV=production` to stay fair.

Also benchmark sc's own best practices (transient props, `.attrs`, css-var patterns with sc) — beating a strawman config wins arguments but not users.

---

## 10. Methodology & statistical rigor

- **Interleave A/B/C runs** (yak, sc, vanilla, yak, sc, vanilla…) rather than blocks, to spread thermal and background drift across all variants.
- ≥ 30 iterations per cell for browser metrics; report **median + IQR**, compare with **Mann-Whitney U** (perf samples aren't normal); flag results where the effect size is smaller than run-to-run variance. Tachometer's auto-sample-until-significant model is a good template for microbenches.
- Warm-up runs discarded (JIT tiering, disk cache, font cache); separately *also* record cold-start numbers explicitly — cold is a real user state, not noise.
- New browser profile per scenario; same profile across variants within a scenario.
- Pin versions and record a manifest (chrome, node, next, react, sc, yak commit) into every results file; results are append-only JSONL with the manifest hash.
- For phones: thermal gating (§4.4), and repeat the suite on two physical units to catch device-specific anomalies.
- Automate everything: a single `pnpm perf` entry that builds all app variants, drives them (Playwright + CDP), parses traces, and emits a comparison report. Manual DevTools sessions are for investigation, never for the numbers we publish.
- **Trace-first measurement**: prefer extracting metrics from Chrome traces (events with timestamps) over JS-side timers where possible — JS timers perturb less-powerful devices.
- Publish the harness in-repo (`benchmarks/e2e/`) so results are reproducible by outsiders — credibility is part of the goal ("fastest" is a public claim).

---

## 11. Tooling catalog

| Tool | Use |
|---|---|
| Playwright/Puppeteer + CDP | drive scenarios, capture traces (`Tracing.start` with categories below), Event Timing, CPU throttle (`Emulation.setCPUThrottlingRate`) |
| Trace categories | `devtools.timeline`, `blink,blink_style`, `disabled-by-default-devtools.timeline.invalidationTracking` (style invalidation counts + reasons!), `v8`, `disabled-by-default-v8.compile`, `v8.gc`, `v8.runtime_stats`, `blink.user_timing` |
| Perfetto / trace_processor | SQL over traces for batch metric extraction (sum of Recalc durations per interaction, etc.) |
| Chrome DevTools Selector Stats | per-selector match cost |
| LoAF + Event Timing APIs | in-page INP attribution (which script, which phase) |
| React `<Profiler>` + React DevTools profiler + scheduler track | commit durations, fiber counts per slice |
| Lighthouse user flows | scripted load+nav+interact composite reports per variant |
| WebPageTest (private instance) | real low-tier Android devices, packet-level waterfalls |
| Safari Web Inspector + safaridriver on real iPhone | WebKit timelines for E-series experiments |
| `node --cpu-prof`, clinic.js, autocannon | SSR race |
| Deopt Explorer / `--trace-deopt --trace-ic` / `%GetOptimizationStatus` | §7 JIT audit |
| `speedscope` | flamegraph diffing between libraries |
| esbuild/`source-map-explorer`/`next-bundle-analyzer` | bytes attribution |
| Chrome allocation sampling, `measureUserAgentSpecificMemory`, heap snapshots | §G |
| `mitata`/`tinybench` + `tachometer` | JS microbenches with statistical stopping |
| chrome-devtools MCP (available in this repo's tooling) | interactive trace capture/insight during investigation |

---

## 12. The galaxus-shaped macro benchmark

Synthetic micros tell us *why*; one realistic app tells us *whether it matters*. Build **"YakShop"**, a small Next.js App Router shop, twice (yak / sc) + once vanilla, sharing identical markup and design tokens:

- **PLP**: header with mega-menu (50 styled nodes), filter sidebar (30 interactive controls), 60 product cards (each ~25 styled elements: image frame, badges, price, rating stars, energy label, CTA) ≈ **2,000 styled elements**.
- **PDP**: gallery with thumbnails, variant picker (dynamic selected states), sticky buy-box, spec table (200 rows), 12-card recommendation slider.
- Dynamic styling that mirrors galaxus reality: badge colors by prop, availability states, selected-variant highlight, quantity stepper, hover elevations, compact/comfy density toggle, dark mode.
- Scripted journeys (Lighthouse user flows / Playwright): cold load PLP → filter twice → nav to PDP → pick variant ×3 → gallery swipe ×5 → add to cart → back → load more (next 60 cards).

Report the full §5 metric set per journey step, per device class, for all variants. This single artifact answers the business question ("how many ms does yak buy galaxus on a real PDP on a mid iPhone?") and doubles as the regression fixture for §14.

Bonus: since galaxus already runs next-yak in production, complement the lab with **field data**: a RUM slice (INP with LoAF attribution, soft-nav timing, recalc-heavy frames via LoAF `scripts`/`styleAndLayout` durations) before/after yak runtime optimizations ship. Lab proves causality; field proves relevance.

---

## 13. Optimization backlog: making more static

Ranked ideas the benchmarks above will validate or kill:

1. **Zero-wrapper static components.** `styled.div` with no dynamics, no attrs → compile call sites to plain `<div className="yak_x …">` (or compile the component to a const that React renders without our closure). Eliminates 100% of runtime cost for the majority class of components. Handle: `as` prop, refs, `css` prop merging — possibly only when the compiler proves they're unused. *(Validated by H3/D4.)*
2. **Compiler-deduped className strings.** The compiler knows every class it emits → precompute joined strings, drop the per-render `Set`/`split`/`Array.from`/`join`. Conditional classes become string concatenation of precomputed segments.
3. **Static `$`-prop elimination.** Compiler knows the transient props per component → emit explicit prop pick/omit (or rename to a non-forwarded slot) instead of the runtime `startsWith("$")` loop over all props.
4. **Pre-shaped style objects.** Emit style objects with all var keys present (stable hidden class), or set vars via a tiny flat array; omit `style` entirely when empty (H11).
5. **`@property` emission with `inherits: false`** for every yak variable not used by descendants (compiler can often prove this) → kills the subtree invalidation (H1/E1). Also unlocks transitionable/typed custom properties (D10).
6. **Var-free dynamic styles when same-element.** If the dynamic value is consumed only by the element it's set on, write the CSS property directly into inline style at compile time (`style={{width: props.w}}`) — skip the var indirection (E5).
7. **Compile units into the consumer** (`calc(var(--x) * 1px)`) instead of the runtime `unitPostFix` wrapper (H9).
8. **Prefer class toggles over vars for boolean/enum props automatically** — the compiler can detect 2–5-valued interpolations and emit variant classes (decided by D2/D3 results).
9. **Per-route CSS shaking of dead conditional branches** (H5/A3).
10. **Static attrs folding** — attrs objects without functions merged at compile time (H7).
11. **Per-component specialized render functions** if §7.2 shows megamorphism matters — codegen tradeoff: bytes vs IC quality; measure both sides.
12. **Theme via CSS variables, compiler-assisted** — `${({theme}) => theme.color.primary}` lowered to `var(--theme-color-primary)` statically, deleting the context read (H8/D6).
13. **SSR HTML weight**: shorter prod class hashes; avoid repeating multi-class strings on thousands of cards (H10).
14. **CSS chunk prefetch guarantees on soft nav** (H4) — verify/ensure Next prefetches route CSS with the route JS.
15. **Runtime `Set`→string, spread→`Object.assign`-style codegen where it measures faster** — guided strictly by §7 microbenches, not aesthetics.

Each item gets: expected win (from the benchmark that motivated it), implementation cost, and a re-run of the relevant scenario as acceptance test.

---

## 14. Continuous performance in CI

- **Size budgets**: runtime ≤ 3 KB gzip hard limit (`size-limit`), per-fixture CSS output byte tracking (snapshot test on generated CSS size for the benchmark apps — catches compiler regressions emitting bloated CSS).
- **SSR bench in CI** on a dedicated runner (or CodSpeed/Bencher for noise-resistant CI benching) — fail PRs on >5% regression in any existing bench case.
- **Browser smoke perf**: one Playwright trace-based scenario (D4 + C1 on 4× throttle, Linux runner) with budgets on Recalc total, commit duration, and long-task count. Noisy, so gate on 3-run median with generous thresholds; the goal is catching 2× regressions, not 5% ones.
- **Allocation regression test**: count allocations per render via a Node heap-sampling harness around `renderToString` of the 1000-component fixture — cheap, deterministic-ish, catches "someone added a spread to the hot path".
- Nightly full matrix (all scenarios, real devices via self-hosted runner + ADB) publishing a dashboard (append-only JSONL → static chart page in `docs/`), so trends are visible across commits, not just PR-vs-main.

---

## 15. Prioritized roadmap

**Phase 0 — foundations (days):** add vanilla baseline lanes to existing `gen.ts` benches; build the Playwright+CDP trace harness with interleaved runs + JSONL output; pin environment manifest. *(Already have: SSR suite, bundle-size numbers.)*

**Phase 1 — the decisive experiments (week 1–2):** E1 (custom-property invalidation scope, 3 engines) → D3 (descendant cliff) → D1/D2 (continuous vs toggle) → B1 (hydration scaling) → F2 (INP task-length cliff). These five decide most of §13's priorities.

**Phase 2 — JIT & allocation audit (week 2–3):** §7 full pass: chunk-shape verification, deopt/IC analysis, allocation audit, microbench Set-vs-string & prop-filter. Output: validated H2/H6/H11/H12 verdicts + prototype of backlog item 1 (zero-wrapper) measured on D4.

**Phase 3 — YakShop macro benchmark (week 3–5):** build §12, run full device matrix, produce the headline report (per-journey, per-device, yak vs sc vs vanilla).

**Phase 4 — navigation & long-session (week 5–6):** C1–C4, G3, A4 cache economics.

**Phase 5 — productize (ongoing):** §14 CI gates, docs guidance derived from D2/D3/E6 ("when to use vars vs toggles vs containment"), publish methodology + results.

---

## 16. Appendix

### 16.1 Baseline numbers [measured 2026-06-09, this repo, Apple Silicon dev machine]

- next-yak client runtime (`dist/internal.js`, esbuild `--minify`, react external): **6,774 B min / 2,749 B gzip** — including all ~170 tree-shakeable tag helpers; the core without unused tags is smaller in a real app build.
- styled-components 6.4.1 (`styled-components.browser.esm.js` bundled with stylis & friends, react external): **33,652 B min / 13,279 B gzip**.
- SSR throughput (`pnpm bench` in `benchmarks/`, NODE_ENV=production, ≥77 samples each, **[measured 2026-06-09, Gate 0 run with vanilla lanes — supersedes the same-day pre-vanilla run]**):

| Benchmark | styled-components ops/s | next-yak ops/s | vanilla ops/s | yak vs sc | yak % of optimum |
|---|---:|---:|---:|---|---|
| Kanji letter | 320 | 385 | — | **+20%** | — |
| Pure components ×1000 | 826 | 1,543 | 2,433 | **+87%** | 63% |
| Attrs ×1000 | 430 | 830 | — | **+93%** | — |
| CSS prop ×1000 | 796 | 2,967 | — | **+273%** | — |
| Dynamic props ×1000 | 259 | 207 | 476 | **−25%** ⚠ | 44% |
| Dynamic props (idiomatic) | 341 | 673 | — | **+98%** | — |
| Nested components | 2,205 | 969 | 4,854 | **−127%** ⚠ | **20%** |
| Tree | 182 | 141 | 463 | **−29%** ⚠ | 30% |
| Tree (idiomatic) | 177 | 200 | — | **+13%** | — |
| Tree deep | 315 | 240 | 745 | **−31%** ⚠ | 32% |
| Tree wide | 358 | 262 | 948 | **−37%** ⚠ | 28% |
| Sierpinski | 1,124 | 1,255 | — | **+12%** | — |
| Cross request cache | 514 | 365 | 1,432 | **−41%** ⚠ | 26% |
| SSR extraction | 200 | 1,336 | — | **+568%** | — |

**Reading of the losses (⚠):** every losing case is dominated by per-element runtime overhead with dynamic values or composition — exactly H2 (Set/spread/`Array.from` allocations), H7 (attrs/composition closure chains, see "nested" −127%), H16, and the CSS-var evaluation path; sc wins these because its class cache makes repeated identical dynamic values nearly free (see especially "cross request cache" −41%: stable props across requests are sc's best case and yak re-evaluates everything). The idiomatic (class-toggle) variants flip dynamic-props from −25% to +98% and tree from −29% to +13% — direct evidence for backlog items 1, 2, 8 and for compiler-preferring class toggles.

**Reading of the vanilla lane (Gate 0's key insight):** yak runs at **20–44% of the hand-written optimum** in every losing case and only 63% even in the fully static pure-components case. The losses to styled-components are a symptom; the disease is a 2–5× runtime tax over plain JSX. Note sc is *also* far from optimum (nested: 2,205 vs 4,854 = 45%) — the winner of yak-vs-sc in these cells is just the library with the smaller tax. First profile (nested-yak, 3,000 iterations): **76.7% of total CPU is next-yak runtime self-time** (the `Yak` render closure alone: 72.4%), react-dom only 12%. Eliminating the runtime for static/composed components (backlog #1, P3/P5) is therefore worth up to ~4× in these workloads, not the 30–40% the sc comparison suggests.

### 16.2 Harness sketch — trace-driven interaction benchmark (Playwright + CDP)

```ts
const client = await page.context().newCDPSession(page);
await client.send("Emulation.setCPUThrottlingRate", { rate: 6 });
await client.send("Tracing.start", {
  traceConfig: { includedCategories: [
    "devtools.timeline", "blink,blink_style", "v8", "v8.gc",
    "disabled-by-default-devtools.timeline.invalidationTracking",
  ]},
});
await page.click("#toggle-density");           // the scenario
await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const trace = await stopAndCollect(client);    // Tracing.end + dataCollected events
// extract: sum(RecalculateStyles.dur), sum(UpdateLayoutTree invalidation counts),
//          sum(Layout.dur), long tasks, EventTiming for INP — via trace_processor SQL or a small parser
```

### 16.3 POC sketch — inherited custom property invalidation (E1, no React)

```html
<div id="root"><!-- N nested/flat descendants, X% containing `var(--x)` usage --></div>
<script>
  const root = document.getElementById("root");
  // variant A: root.style.setProperty("--x", v)
  // variant B: root.classList.toggle("alt")  (with .alt { --x: v } or .alt { color: red })
  // variant C: CSS.registerProperty({name:"--x", inherits:false, ...}) then A
  // measure: performance.now() around a forced style flush: getComputedStyle(probe).color
  // cross-check numbers against the trace's RecalculateStyles event (JS timing lies on throttled devices)
</script>
```

Run in Chrome, Safari (real iPhone), Firefox. Plot recalc duration vs N per variant per engine.

### 16.4 POC sketch — V8 optimization probe (§7.2)

```js
// node --allow-natives-syntax probe.mjs
import { renderToString } from "react-dom/server";
for (let i = 0; i < 1e4; i++) renderToString(<Page />);   // warmup / tier-up
console.log(%GetOptimizationStatus(internalRenderFnRef)); // bit flags: optimized? maglev? turbofan?
```

Plus `--trace-ic` → Deopt Explorer to inspect IC states of `p`, `T`-processors, `m`, `G` (names per `runtime/styled.tsx` / `cssLiteral.tsx`).

### 16.5 Experiment infrastructure (added 2026-06-09, branch `perf`)

- **Vanilla lane**: `benchmarks/bench/*/gen.ts` now also emit `*.vanilla.tsx` (hand-written plain JSX, literal classNames, CSS-var style object literals — the "perfect compiler output") for the 6 losing benches + pure-components. The bench table has `vanilla (ops/sec)` and `yak vs vanilla` (% of optimum) columns.
- **Profiling runner**: `pnpm bench:profile:build && pnpm bench:profile <case> <iterations>` (unminified bundle, `--cpu-prof`); `pnpm bench:profile:heap` for allocation profiles; `pnpm bench:profile:analyze <file.cpuprofile>` aggregates self-time by category (next-yak-runtime / styled-components / react-dom / …) and per function. Cases: `{pure,nested,dynamic,tree,tree-deep,tree-wide,cross-request}-{yak,styled,vanilla}`.
- **Freshness rule**: always `pnpm --filter next-yak build` before `bench:build` — the bench bundles next-yak from `dist/`.
- **Engine experiments**: `benchmarks/experiments/*.html` (plain DOM, no React), driven via chrome-devtools MCP.

### 16.6 References

- Chromium issue referenced for descendant style invalidation: https://issues.chromium.org/issues/342214592 (login-walled; behavior class: inherited/custom-property and inline-style changes invalidating descendant subtrees)
- Blink style invalidation design doc: https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/core/css/style-invalidation.md
- CSS `@property` / registered custom properties (inherits:false) — web.dev & CSS Houdini spec
- React scheduler time slicing (~5 ms yield interval), `useInsertionEffect` semantics — react.dev
- LoAF & Event Timing (INP attribution) — web.dev/loaf
- Existing suite: `benchmarks/bench/index.bench.tsx`, generators in `benchmarks/bench/*/gen.ts`
- Runtime source: `packages/next-yak/runtime/styled.tsx`, `runtime/cssLiteral.tsx`, `runtime/internals/*`

---

## 17. Experiment log (append-only)

Protocol: every experiment appends exactly one entry here; the matching hypothesis bullet in §8 gets prefixed in place with ✅ CONFIRMED / ❌ DEBUNKED / 🟡 PARTIAL + the EXP id. On every full SSR-suite re-run, §16.1's table is re-pasted with a fresh date stamp.

Entry template:

```
### EXP-<YYYYMMDD>-<NN> — <title> (refs: H#, D#/E#, backlog #N)
- Env: machine, Chrome/Node versions, commit, CPU throttle
- Setup: files + exact commands + parameters
- Numbers: table (median+IQR or ops/s ±rme; include vanilla lane where it exists)
- Verdict: CONFIRMED / DEBUNKED / PARTIAL / INCONCLUSIVE — one sentence
- Next action: graduate to backlog #N / drop / follow-up EXP
```

### EXP-20260609-01 — Gate 0: vanilla "speed of light" lane + profiling infra (refs: §3, H2, H3)
- Env: Apple Silicon dev machine (Darwin 25.5.0), Node 22+, Chrome n/a, branch `perf`, NODE_ENV=production
- Setup: added `*.vanilla.tsx` lanes (plain JSX, literal classNames, CSS-var style literals) to pure-components, nested-components, dynamic-props, tree, tree-deep, tree-wide, cross-request-cache; new `bench:profile*` scripts (unminified cpu/heap profiling + analyzer). Commands: `pnpm --filter next-yak build && cd benchmarks && pnpm bench`.
- Numbers: full table re-pasted in §16.1. Key: yak at 20% (nested), 26% (cross-request), 28–32% (trees), 44% (dynamic) and 63% (pure/static!) of vanilla optimum. First CPU profile (nested-yak): 76.7% of CPU = next-yak runtime self time, react-dom 12%.
- Verdict: CONFIRMED (H2/H3 direction) — the runtime tax, not styled-components' speed, explains all losing cells; even static components pay ~1.6×.
- Next action: 1a.1 profiling swarm for precise per-function attribution; P-hacks (1a.2) with vanilla gap as the success metric.

### EXP-20260609-03 — Agent C: CrossRequestCache autopsy (refs: H16, backlog #8/#2)
- Env: as EXP-01; 1500 iterations/case (×6 mounts ×200 children = 300k child renders/lane)
- Setup: `pnpm bench:profile cross-request-{yak,styled,vanilla} 1500` + heap profiles (heap sampling proved live-object/startup-biased — unusable for rates; GC self-time used as allocation-rate proxy instead: yak 43.6 µs/iter vs sc 25.2 vs vanilla 21.8 ≈ yak allocates ~2× sc)
- Numbers: yak 421 / sc 566 / vanilla 1782 ops/s. CPU: yak-runtime 64.7%, sc-runtime 71.3% (sc is also runtime-bound!), vanilla react-dom 66.7%. Per child: yak 8.8 µs, sc 6.7 µs, vanilla 2.8 µs. sc's cache only skips stylis parse + injection (stylis: **0.7 ms total** across 300k renders; uncached would be ~6 s → cache removes ~75% of sc's would-be cost) but sc still re-executes interpolations + re-hashes per render. yak's loss decomposes: dynamic-fn re-execution ~921 ms (24%, dominated by `recursivePropExecution`, 900k calls), identical-result assembly ~1,649 ms (42%: spreads/Set/join/destructure ×2 chain levels), react-dom style-attr emission +222 ms vs sc (class-only HTML). ~66% of yak's total time is recomputation producing byte-identical results.
- Verdict: H16 🟡 PARTIAL — cache asymmetry real but half the story; yak's per-render assembly constants are the co-equal cause.
- Next action: ranked ceilings — (1) compile-time enum-prop→class-toggle hoisting (~3–3.5×, all 4 props here are enums = 48 variants); (2) runtime memo keyed on consumed-$prop value tuple (~2.3×); (3) P-hacks alone ≈ sc parity (~1.3×). Feeds backlog #8 strongly.

### EXP-20260609-04 — Agent B: Tree-family + DynamicProps autopsy (refs: H2, H9, H11)
- Env: as EXP-01; tree 3000 it, tree-wide/dynamic 2000 it; line-level positionTicks + inspector sampling heap profiler (16 KB interval, includes GC'd objects)
- Numbers: tree-yak 7.15 ms/render vs vanilla 2.21 (3.2×). Tree = 2,968 styled Boxes → **5,936 Yak invocations** (2-level styled(View) chain) + 8,904 CSS-var evals per render. Allocation tax: yak **+6.1 MB/render (+90%)** vs vanilla in tree ≈ **2 KB / 14–16 allocations per element** (vanilla Box: ~175 B); Set+split+from+join = 50% of the allocation tax. dynamic-styled spends 68.3% in sc: per-render concat+hash of the full CSS string (1.4 ms/render) — sc's cache only saves stylis, not interpolation+hash.
- **Measurement caveat / bonus find:** unbundled `dist/internal.js` does a live `process.env.NODE_ENV` access inside `recursivePropExecution` per dynamic-value call (~165 ns × 8.9k calls/render in tree = up to 35% of dynamic-yak's profile). Bundlers fold it (the real bench bundle has zero occurrences), but any unbundled Node SSR consumer pays it → hoist to module scope (new P7).
- For the **dynamic cell**, P1–P4 barely help: the tax is the per-prop pipeline (megamorphic user arrows ~2.6× dearer than inlined logic, `String()` conversions, dict-mode style stores). Needs compile-side fix (per-component style builders / pass values not thunks / enum→class hoisting per EXP-03).
- Verdict: H2 ✅ CONFIRMED (allocation-bearing constructs = 70–75% of corrected yak tax in tree family); H9 ⚪ NOT EXERCISED by these fixtures (no unitPostFix in compiled output); H11 🟡 PARTIAL (unconditional spread+assign real but ≤0.8% here since styles are never empty in these fixtures — matters for Pure/Nested instead).
- Next action: P1 confirmed top priority for tree family (13.5–14.5% of total CPU); P3/P5 for chain re-entry; dynamic cell → backlog #8/#11 compile-side work.

### EXP-20260609-05 — P1+P2+theme-gate+env-guard runtime hacks (refs: H2, H11, H12-partial, backlog #2/#15; commit 4f7ccf3)
- Env: as EXP-01; full benchmark.js suite (minified bundle, ≥50 samples), machine quiet
- Setup: string-backed `ClassNames` collector replacing `new Set(split)`→`Array.from().join` (Set-like add/has/delete kept for atoms/css-prop contracts — 3 tests enforce them); inner chain levels skip className/style processing entirely; style cloned only for dynamic processors and omitted when absent (H11); `useTheme()` gate fixed from function-ARITY (always truthy — every component read theme context!) to a `$dynamic` processor flag; `process.env.NODE_ENV` access moved behind the typeof guards in `recursivePropExecution`. 182 runtime tests green.
- Numbers (sc / yak / vanilla ops/s, Δ = yak-vs-sc change from Gate 0):

| Benchmark | sc | yak | vanilla | yak vs sc | was (Gate 0) | % of optimum |
|---|---:|---:|---:|---|---|---|
| Kanji letter | 318 | 605 | — | **+90%** | +20% | — |
| Pure components | 779 | 1,967 | 2,348 | **+153%** | +87% | **84%** (was 63%) |
| Attrs | 431 | 899 | — | **+109%** | +93% | — |
| CSS prop | 790 | 3,372 | — | **+327%** | +273% | — |
| Dynamic props | 267 | 313 | 508 | **+17%** | −25% ⚠→✓ | 62% (was 44%) |
| Dynamic (idiomatic) | 350 | 673 | — | +92% | +98% | — |
| Nested components | 2,163 | 2,170 | 4,579 | **+0.3%** | −127% ⚠→tie | 47% (was 20%) |
| Tree | 179 | 205 | 470 | **+14%** | −29% ⚠→✓ | 44% (was 30%) |
| Tree (idiomatic) | 186 | 252 | — | +36% | +13% | — |
| Tree deep | 309 | 328 | 752 | **+6%** | −31% ⚠→✓ | 44% (was 32%) |
| Tree wide | 320 | 385 | 918 | **+20%** | −37% ⚠→✓ | 42% (was 28%) |
| Sierpinski | 1,090 | 1,757 | — | **+61%** | +12% | — |
| Cross request cache | 494 | 500 | 1,387 | **+1.3%** | −41% ⚠→tie | 36% (was 26%) |
| SSR extraction | 205 | 1,628 | — | **+694%** | +568% | — |

- Verdict: CONFIRMED — **next-yak now wins or ties all 14 cells**; H2's mechanism (Set/spread marshaling) was the dominant cost exactly as profiled. Nested/cross-request are statistical ties → P5 targets them.
- Next action: P5 (chain flattening, commit 10cce38) measured next; remaining gap to vanilla (36–84%) = wrapper spreads + filter loop → P3/P4 and compiler work (backlog #1).

### EXP-20260609-06 — P5: flatten styled(Component) chains (refs: H7/H12 multiplier, backlog #1-partial; commit 10cce38)
- Env: as EXP-01; full minified suite, quiet machine
- Setup: the `yakComponentSymbol` tuple now carries the chain's ultimate render target; N-level chains render in ONE wrapper (attrs/style processors were already merged at construction). $-props (incl. internal markers) now always filtered before the target — two tests proved markers must not cross custom-component boundaries (an unflattened intermediate custom component re-processing its own attrs). 182 tests green.
- Numbers (vs EXP-05): Nested 2,170→**3,228** (+0.3%→**+44%** vs sc, 64% of optimum), Cross-request 500→**694** (+1.3%→**+34%**), Tree 205→257 (+40%), Tree deep 328→414 (+29%), Tree wide 385→468 (+26%), Kanji 605→750 (+123%), Sierpinski 1,757→2,122 (+88%), SSR extraction +743%. No regressions.
- Verdict: CONFIRMED — the ×N re-entry was the structural multiplier (EXP-02); **all 14 cells now ≥+17% ahead of styled-components**.
- Next action: P3 static fast path (skip theme/spreads for static components) to close the remaining vanilla gap (50–82%).
