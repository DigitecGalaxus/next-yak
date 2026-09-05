# Lessons learned: @yak/solid runtime performance

Working notes from the runtime performance campaign. Goal: SSR and client throughput of
`@yak/solid` close to `next-yak` on React. Runtime changes only, no compiler work.

Numbers are instances per second (higher is better), median of 51 samples, measured with a
private harness that builds the css-in-js-bench `yak-solid` lane against the worktree
`dist/` and Solid 2.0.0-rc.6. React reference is the bench's `next-yak` lane on the same
machine and day.

## Baseline (working tree at start, 2026-09-05)

| case | yak-solid | next-yak (React) | ratio |
|---|---:|---:|---:|
| button-variants-nested | 1,012,231 | 1,302,719 | 0.78 |
| multifile-shop | 48,367 | 103,769 | 0.47 |
| dyn-fair | 478,297 | 811,771 | 0.59 |
| dyn-translate | 473,074 | 831,371 | 0.57 |
| product-grid | 275,411 | 198,721 | 1.39 |
| tabs | 15,519 | 84,138 | 0.18 |
| multifile-composition | 15,242 | 79,879 | 0.19 |
| compose-1 | 4,927,128 | 2,232,561 | 2.21 |
| button-variants | 5,162,383 | 2,248,879 | 2.30 |
| realistic-button | 1,542,217 | 847,997 | 1.82 |

Cases the compiler folds to a template are already 2x React. The gap is entirely in
cases that keep a wrapper component per element: imported primitives, dynamic
interpolations, and `styled(Component)`.

## Measurement lessons

- A scratch Vite build that aliases `@yak/solid`, `@yak/solid/internal` and
  `@yak/solid/context` to the worktree `dist/` reproduces the bench's SSR numbers within
  noise. Use `resolve.dedupe` for `solid-js`, `@solidjs/web` and `@solidjs/signals` so
  the worktree runtime and the bench cases share one Solid copy.
- Vite's CLI config loader cannot load the ESM-only yak plugin. Import the config and
  call `build()` from the Vite API, as the bench's own `gen.ts` does.
- Byte-identical HTML does not prove hydration. Solid derives `_hk` from the owner tree,
  so a memo more or less on one side shifts every following key. Every experiment gets a
  real round trip: server render, then `hydrate()` under jsdom on that HTML and a check
  that every server node was reused. `getNextElement` throws on a key miss.
- `isServer` from `@solidjs/web` is an export-condition switch, not a Node check. Vitest
  with jsdom needs `resolve.conditions: ["browser", "development"]` to get the client
  build, jest's jsdom environment defaults to `browser`. A misconfigured runner runs the
  client path on the server: slower, never wrong.

## Profile of the remaining cost (SSR, before this campaign)

multifile-shop (12 leftover static tag wrappers per tile): `ssrElement` 33%, signals
`merge` 11%, GC 10%. multifile-composition (component targets): the case's own
`omit(props, "isActive")` 19%, `ssrElement` 14%, yak's two `merge` calls 9%.

## Experiments

Deltas are interleaved A/B medians against the baseline bundle in the same process, so
machine drift hits both sides alike. Single-digit deltas are noise on this machine.

### E1: own keys and no undefined in the eager server object (kept)

`for (const key of Object.keys(props))` instead of `for...in`, and contributed values
that are `undefined` are left out. Speed-neutral. Removes the `style=""` that
`ssrElement` emits for an undefined style, because its style and class branches run
before its undefined check. Own keys match `ssrElement` and the client spread, which in
rc.6 ignores inherited props.

### E2: theme overlay on the dynamic path (kept as E2b)

`merge({ theme }, props)` ran once per element on every styled component with a dynamic
interpolation. `merge` with two plain sources takes its copy branch: one descriptor and
one bound getter per prop, per element.

| variant | dyn-fair | dyn-translate | multifile-shop | tabs |
|---|---:|---:|---:|---:|
| merge (baseline) | 100% | 100% | 100% | 100% |
| E2: `Object.create(props)` with an own `theme` | 92% | 89% | 102% | 93% |
| E2b: Proxy that answers `theme` and forwards the rest | 171% | 170% | 120% | 111% |

E2b puts dyn-fair and dyn-translate at parity with React. The prototype chain was slower
than the merge it replaced: every element gets its own prototype object, so the
interpolation's read site sees a new hidden class each time and goes megamorphic. A Proxy
is one allocation and its `get` trap is monomorphic at the call site. Lesson: for a
lazily-read overlay of one or two keys, a Proxy beats both a merge and a prototype chain.

### E5: descriptor copy instead of a Proxy when there are no attrs (kept)

Component targets and the client tag path handed the target a Proxy. The bench's
component cases spread and `omit` those props, and every enumeration by the target walks
`ownKeys` plus one `getOwnPropertyDescriptor` trap per key. With no attrs the key set is
fixed at creation, so the props are now a plain object built by copying each descriptor
with `Object.defineProperty`. Compiled getters are closures that ignore `this`, so the
descriptors go over unchanged, no bind per getter as `merge` does. Contributed `class`
and `style` are own getters.

| case | vs E2b |
|---|---:|
| tabs | 108% |
| multifile-composition | 108% |
| multifile-shop | 119% |
| dyn-fair | 124% |
| product-grid | 101% |

The Proxy stays only for the attrs path, where keys appear after the attrs memo ran.
Lesson: a Proxy is the right shape when the consumer reads a few keys; when the consumer
enumerates (a spread, `omit`, `merge`), a one-time descriptor copy is cheaper than trap
calls on every enumeration.

### E9: collect the static class once per styled component (kept)

The fast path built a `Classes` collector and ran the style processor on every element
read of `class`. A static processor reads no props, so its result is the same for every
element: it is now collected once when the styled component is created, and the getter
returns that string directly when the author passed no `class`. The collector path stays
for elements with a user class, so dedup semantics are unchanged.

button-variants-nested +16% to +26% in both A/B orders; every other case within noise.

## SSR cost floor per element (research, Solid 2 rc.6 vs React 19, n=4000)

| shape | Solid ns/el | React ns/el |
|---|---:|---:|
| compiled static template vs `createElement("div", {className})` | 74 | 172 |
| `ssrElement("div", 4 plain props)` vs `createElement` with 4 props | 541 | 484 |
| same through a wrapper component | 541 | 588 |
| wrapper plus one `createMemo` per element (what `dynamic()` adds) | 682 | |
| wrapper with an object of getters as props | 895 | 1510 |
| wrapper with a Proxy as props | 1813 | 2864 |

`Object.keys` plus a read of every value, 4 keys, no framework: plain object 47 ns,
object of getters 437 ns, Proxy 1405 ns, copy to a plain object then read 97 ns. A
Proxy read is 30 times a plain read, an object of getters 9 times. That is why the eager
copy on the server pays for itself many times over, and why component targets, which
cannot take a thunk, are the widest gap.

Other findings:

- A wrapper component costs nothing on Solid's server (`createComponent` is a plain
  call) and about 105 ns on React. The wrapper is not why yak-solid is behind.
- `dynamic()` opens one memo owner per element. Besides the 140 to 180 ns, every
  hydration key gains a nesting level (`_hk=10` instead of `_hk=1`), and at the top
  level of a render `resolveSSRNode` also inserts a `<!--!$-->` separator between
  neighbours: +14% HTML bytes in that position.
- GC is 30% to 37% of SSR self time on both yak paths. The static tag path makes about
  18 allocations per element against React's 5; most are memo machinery and closures.
- Yak's own code is 8% to 10% of self time. The rest is Solid's element serialization,
  memo machinery and GC.

### E8: tag targets render with the compiler primitives, no per-element memo (kept)

A tag target went through Solid's `dynamic()`, which wraps the element in a memo so the
tag can change. A styled component's tag never changes. The renderer now does what the
compiler emits for `<tag {...props} />`: on the server `ssrElement(tag, thunk,
undefined, true)`, on the client `getNextElement(template)` then `spread(el, props)`
then `runHydrationEvents()`. Namespaced elements are cloned out of an `<svg>` or
`<math>` root the way the compiler does it (`template` flag 2). On the server the
template helper is never called; it is a throwing stub there.

Hydration keys lose one nesting level on both sides (`_hk=010` becomes `_hk=1`), which
the round trip confirms on all 14 cases, and the HTML gets shorter.

| case | vs E10 |
|---|---:|
| button-variants-nested | 127% |
| dyn-fair | 115% |
| multifile-shop | 107% |
| product-grid | 107% |
| tabs | 99% |

Lesson: `getNextElement`, `template`, `spread`, `ssrElement` and `runHydrationEvents`
are the compiler's output contract and are exported on both builds. A runtime that
knows its tag can use them directly and save an owner per element.

Research confirmation for E8 (round-tripped by an agent under jsdom with nested styled
children, `For`, `Show`, svg/path, `onClick`, a reactive class, and a negative control
that fed memo-shaped HTML to the memo-free client: it threw `Hydration Mismatch`, so the
passes are real matches):

- The per-element memo buys nothing for a constant tag: disposal, error boundaries,
  `Loading` and transitions behave the same with and without it. It costs one owner per
  element, about 2x SSR time and 2.4x hydrate time on a 1000-element page, and 12% HTML.
- `dynamic()` never calls `runHydrationEvents()`, so a page whose only interactive
  elements are styled tags can drop clicks captured before hydration. The direct path
  calls it, like the compiler does.
- Four tags exist in both HTML and SVG: `a`, `script`, `style`, `title`. Their namespace
  depends on the parent, which only `dynamic()` resolves at insertion time (rc.6 defers
  element creation into `insert` for that). Those four keep `dynamic()`.
- Wire-format change: hydration keys lose a level, so server and client must run the
  same `@yak/solid` version. Worth a release note.
- `sharedConfig` is exported from `solid-js`, not from the client entry of `@solidjs/web`;
  `getInsertionParent` is missing from the server entry. Named imports of either fail to
  link on one side. The direct path needs neither.

## Cumulative after E1, E2b, E5, E8, E9, E10 (SSR)

| case | baseline | now | next-yak (React) | now vs React |
|---|---:|---:|---:|---:|
| button-variants-nested | 989,813 | 1,689,309 | 1,189,591 | 1.42 |
| multifile-shop | 47,150 | 78,657 | 108,825 | 0.72 |
| dyn-fair | 471,819 | 982,922 | 793,861 | 1.24 |
| dyn-translate | 482,655 | 987,898 | 818,945 | 1.21 |
| product-grid | 229,254 | 311,871 | 177,617 | 1.76 |
| tabs | 13,934 | 17,337 | 81,811 | 0.21 |
| multifile-composition | 14,795 | 18,283 | 81,583 | 0.22 |
| compose-1 | 5,124,920 | 5,195,939 | 2,365,464 | 2.20 |
| realistic-button | 1,689,189 | 1,708,187 | 904,431 | 1.89 |

### E14: `for...in` plus `hasOwn` instead of `Object.keys` in the eager thunk (rejected)

Meant to save the keys array allocation. Measured 95% to 103% across four cases, so
nothing gained; `Object.keys` on a small object is cheap and V8 handles it well.

### E16: allocation-free empty-style check (kept)

`Object.keys(style).length > 0` in the dynamic memo became a `for...in` early return.
+1% to +4% on dyn-fair and dyn-translate in both orders, at the noise floor, kept because
it removes an array allocation per element and cannot be slower. Noise floor of the
harness on this loaded machine: two identical bundles measured 95% to 108%.

### E17: class function per styled component, key predicate hoisted (kept, neutral)

The static path allocated a class getter closure and a `skip` closure per element. The
class function now lives once per styled component and takes the props; the client wraps
it in a getter, the server calls it directly. Measured within noise in both orders. Kept
because it removes two allocations per element on the server and is not more code.

### E20: no children insert effect for childless tags (kept, client only)

`spread(el, props, skipChildren)` sets up an insert effect for `children` unless told to
skip. The props object is built before the spread, so `"children" in props` is known;
a childless element now skips that effect. Server output is unchanged; hydrate round
trip passes. Not measurable in the SSR harness; it is one effect less per element on
the client and belongs to the browser sweep.

## Verification so far

- Unit tests: 49 passing, including new tests for svg namespaces, ambiguous tags, and
  element identity across a prop change.
- jsdom hydrate round trip on all 14 bench cases after every kept experiment.
- next-yak e2e, `vite-solid` bundler: dev tests 29 passed plus the HMR cases, build tests
  24 of 24 passed. Run with `node runDevTests.ts vite-solid` and
  `node runBuildTests.ts vite-solid` from `e2e/`.

### E24: one computation on the dynamic path, transparent memo, no server memo (kept)

The dynamic path had an attrs memo and a class/style memo, each an owner and a
hydration id per element on both sides. Now one `compute` function does attrs, classes
and style. On the client it runs inside `createMemo(compute, { transparent: true })`,
which keeps the bindings live and consumes no hydration id. On the server it runs once
per element behind a one-shot cache and there is no memo at all. A styled element now
takes the same hydration key an unstyled element would: the SSR tests assert `_hk=0` for
a dynamic-path element rendered first.

The attrs overlay for the style interpolations is a Proxy over the attrs result object,
built inside the computation; `merge(propsWithTheme, attrsMemo)` with a function source
would have created another memo and id.

| case | vs E22 |
|---|---:|
| dyn-translate | 114% |
| dyn-fair | 112% |
| multifile-shop | 109% |
| tabs, multifile-composition, button-variants-nested | 101% to 102% |

Behaviour change: an attrs function now re-runs when a prop that only a style
interpolation reads changes. The attrs memo never cached anyway (a fresh object per
run), so the extra work is one attrs call in that case. Hydrate round trip passes on all
14 cases; HTML is identical apart from the shorter keys.

### E10: explicit class and style getters, inlined key checks (kept)

`yakProps` took the contributed getters as a `{ class, style }` record and tested every
key with `Object.hasOwn` plus two closures. It now takes the two getters as arguments and
one `skip(key)` predicate does the $-prefix (`charCodeAt(0) === 36`), `class`, `style`,
`theme` and `component` tests inline. Same output, fewer calls per key.

multifile-shop +20% to +40% across orders (twelve wrappers per tile, so the per-key cost
shows), the rest +2% to +7%. Lesson: on the per-element path, the shape of a helper's
arguments matters. A record of getters costs a `hasOwn` per key per element.

## Cumulative after E1, E2b, E5, E9, E10 (SSR, interleaved with baseline and React)

| case | baseline | now | next-yak (React) | now vs React |
|---|---:|---:|---:|---:|
| button-variants-nested | 851,033 | 1,256,348 | 1,162,846 | 1.08 |
| multifile-shop | 45,538 | 67,541 | 107,071 | 0.63 |
| dyn-fair | 464,873 | 859,014 | 825,651 | 1.04 |
| dyn-translate | 457,570 | 859,260 | 822,594 | 1.04 |
| product-grid | 246,856 | 327,076 | 198,441 | 1.65 |
| tabs | 15,479 | 19,148 | 81,801 | 0.23 |
| multifile-composition | 12,319 | 17,146 | 85,478 | 0.20 |
| compose-1 | 5,031,447 | 5,075,060 | 2,254,578 | 2.25 |
| button-variants | 5,047,319 | 5,083,651 | 2,230,067 | 2.28 |
| realistic-button | 1,649,373 | 1,619,761 | 879,959 | 1.84 |

Tag targets with dynamic interpolations reached React. What is left: many static tag
wrappers per tile (multifile-shop) and `styled(Component)` (tabs, multifile-composition).

### E11: bulk descriptor copy (rejected)

`Object.getOwnPropertyDescriptors` plus `Object.defineProperties` instead of the per-key
loop: tabs 91%, multifile-composition 92%. The bulk form builds an intermediate
descriptor map and deletes from it, which costs more than the loop saves.

## Where the component-target cases are bounded

tabs profile on the current build: `ssrElement` 18%, yak's descriptor copy 13%, the
case's own `omit` 13%, signals `ownEnumerableKeys` and the merge Proxy traps 13%, GC 9%.
The case spreads rest props onto its button: `<button {...omit(props, "isActive")} ...>`.
The Solid compiler turns that into `ssrElement("button", () => merge(() => omit(...),
{...}))`: a memo, a merge Proxy, and one trap per key when `ssrElement` enumerates. The
React case does the same spread as a plain object copy. The hand-written vanilla-solid
case has no spread at all (it writes the attributes out), which is why its floor is ten
times the yak-solid number rather than a fair ceiling.

| case | vanilla-solid | yak-solid now | next-yak (React) |
|---|---:|---:|---:|
| tabs | 165,236 | 15,242 | 75,274 |
| multifile-composition | 180,424 | 18,519 | 87,818 |
| multifile-shop | 428,018 | 73,917 | 105,008 |
| product-grid | 633,873 | 304,096 | 194,639 |

Lesson: on Solid, `styled(Component)` where the component spreads props is bounded by
the compiled spread, not by yak. Yak's addressable share on tabs is about 20%.

### E22: single-pass server serializer for tag targets (kept)

The eager server path built a props object and handed it to `ssrElement`, which walked
it again with its own `Object.keys`. The element is now written straight from the three
sources with `ssrElement`'s rules: hydration key first, then the author's props in order
(an attrs value wins at the author's position), then attrs keys the author did not set,
then class and style. Same escaping, boolean, `ref`, `on*`, `prop:` and child-property
handling; `escape`, `ssr`, `ssrStyle`, `ssrClassName`, `ssrHydrationKey`,
`resolveSSRNode` and `ChildProperties` are all exported by `@solidjs/web`. Output is
identical up to whitespace inside tags (`ssrElement` leaves a trailing space when the
last key is dropped; the serializer does not).

| case | vs E20 |
|---|---:|
| multifile-shop | 120% |
| button-variants-nested | 110% |
| dyn-fair | 108% |
| dyn-translate | 107% |
| product-grid | 105% |
| tabs | 99% |

Risk: the attribute rules are copied from `ssrElement`, so a Solid release can change
them. A differential test renders the same props through both and compares.

## Component-target research (Solid 2 rc.6)

- `merge({ theme }, props)` costs about 1,350 ns per element on the client, three
  quarters of the dynamic-path body; a one-key Proxy costs about 115 ns. Confirms E2b.
- `Object.create(props)` demotes the props object to dictionary mode and gives it a
  unique map; end to end it was worse than the merge it replaced. Confirms the E2
  rejection and explains it.
- Eager values for a component target are not hydration-safe: a prop getter that
  renders (`icon={<Icon/>}`, `children`) mints its ids where it is read, and the
  target reads them inside a scope. Reading them early diverges the sequence and can
  throw during hydration. Copying descriptors without invoking them is exactly as safe
  as the Proxy. Confirms E5.
- Do not answer Solid's `$PROXY` symbol: `omit` and `merge` then stack proxies and every
  downstream read pays three traps; end to end slower.
- `useContext` is a single property read on the owner, flat in tree depth: about 6 ns.
- Hydration id accounting: `createMemo` consumes one child id on both sides;
  `createMemo(fn, { transparent: true })` consumes none on both sides; `createComponent`,
  `useContext`, `untrack` and `merge` of plain objects consume none. A function source
  to `merge` creates a memo and consumes one. `effect()` from `@solidjs/web` consumes
  one on the server and none on the client (rc.6 `serverEffect` drops the transparent
  option), so never build server-side id parity on a render effect.
- Proved by round trip: the client can hold one transparent memo for class and style
  while the server computes them with a plain function and no memo at all, and the
  styled element then consumes the same ids as an unstyled one.

### E23: data props copied by value in the descriptor copy (kept, neutral)

A compiled props object holds literal props (`role="presentation"`) as data
properties and reactive ones as getters. The copy now writes data properties as values
and defines getters as descriptors, never invoking them, so the hydration order is
unchanged. Within noise on the bench cases; downstream `omit` and spreads copy a value
faster than an accessor, so it is kept.

## Cumulative after E1, E2b, E5, E8, E9, E10, E16, E17, E20, E22, E23, E24 (SSR)

| case | baseline | now | next-yak (React) | now vs React |
|---|---:|---:|---:|---:|
| button-variants-nested | 957,015 | 1,785,182 | 1,337,868 | 1.33 |
| multifile-shop | 47,241 | 91,516 | 108,003 | 0.85 |
| dyn-fair | 492,985 | 1,186,356 | 795,387 | 1.49 |
| dyn-translate | 491,622 | 1,224,053 | 833,536 | 1.47 |
| product-grid | 256,753 | 379,897 | 200,096 | 1.90 |
| tabs | 14,753 | 19,394 | 78,495 | 0.25 |
| multifile-composition | 12,069 | 19,429 | 80,884 | 0.24 |
| compose-1 | 4,890,980 | 4,740,258 | 2,194,185 | 2.16 |
| realistic-button | 1,610,524 | 1,705,393 | 869,282 | 1.96 |

### E25: attribute writer hoisted out of the per-element closure (kept, neutral)

The serializer's `emit` closure became two module-level functions, `attribute` and
`childContent`. Within noise in both orders. Kept: one allocation less per element and
the serializer reads as a loop over `ssrElement`'s rules.

## Frozen candidate (2026-09-05, evening)

Kept: E1, E2b, E5, E8, E9, E10, E16, E17, E20, E22, E23, E24, E25. Rejected: E2, E11,
E14. Verified: 49 browser unit tests, 131 SSR tests (120 of them a generated
differential matrix against `ssrElement`), the jsdom hydrate round trip on all 14 bench
cases, and the `vite-solid` e2e suite (dev and build).

Open:

- Browser measurements (mount, hydrate, INP) and the bench's verify and screenshot
  gates run in the css-in-js-opus session against the frozen tarball. The client path
  changed in three ways nobody has timed in a browser yet: a plain props object
  instead of a Proxy, no per-element memo for tag targets, and a transparent memo on
  the dynamic path.
- Release note: hydration keys change, so server and client must run the same
  `@yak/solid` version.
- Solid rc bumps: re-run the differential serializer test and the hydrate round trip;
  `dynamic()` internals moved between rc.5 and rc.6.
- Two upstream findings worth reporting to Solid: `serverEffect` drops the
  `transparent` option (rc.6), and a template with a non-scoped element hole before a
  scoped hole diverges server and client ids with no yak in the tree.

What did not work and why, in one line each: a prototype chain for the theme overlay
(megamorphic read sites), a bulk descriptor copy (intermediate map costs more than the
loop), `for...in` in place of `Object.keys` (no measurable gain), and answering
Solid's `$PROXY` (stacked proxies downstream, measured worse by an agent).

## Hydration test and what it caught

The bench cases never render `styled.a`, so the jsdom round trip on them passed while
`styled.a` was broken: on the client it goes through `dynamic()`, whose memo takes a
hydration id, and the server path skipped that memo. The package now has a hydration
test that the bench does not replace: the SSR project snapshots one tree with every
runtime path on it (static tag, dynamic interpolation, attrs, a component target that
spreads, a nested chain, svg, and an ambiguous tag) to `tree.ssr.html`, and the browser
project hydrates that file and requires every server node reused, nothing logged to
`console.error` or `console.warn`, and live bindings afterwards. The four ambiguous tags
now take `dynamic()` on both sides.

The same test flagged a second issue: Solid's dev build warns when a reactive value is
read in a component body outside a tracking scope. The childless-element check read the
attrs memo through the Proxy's `has` trap. A key check is not a subscription, so it runs
under `untrack`, and the trap asks the author's props before the attrs.

The e2e suite has no server rendering for Solid at all: the `vite-solid` bundler renders
with `render()` in the browser, and the Playwright base collects no console output. A
`vite-solid-ssr` bundler with a small render server would close that gap end to end.

## Refactor after the campaign

`yakProps` became a dispatcher over three builders (server render, descriptor copy,
Proxy), the server serializer and the server props object share one walk over the
sources, and the dynamic-path computation and the element template are plain functions.
Measured within noise against the frozen build; hydrate round trip unchanged.
