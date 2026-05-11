# benchmarks

Two suites live here:

1. **CodSpeed runtime benchmarks** under `codspeed/`. Run on every PR via the [`codspeed-benchmarks`](../.github/workflows/codspeed.yml) workflow to catch render-time regressions in the `next-yak` runtime, and to compare against `styled-components` head-to-head on identical workloads.
2. **Interactive Next.js demo viewer** under `app/`. The same generated benchmark components, rendered in a real Next.js dev server so you can inspect the DOM, classes, and CSS that each library actually produces.

## Running

```bash
# Browse benchmarks in dev mode (also runs all generators first):
pnpm dev          # http://localhost:3000
pnpm dev:turbo    # same, but Turbopack instead of Webpack

# Regenerate just the source files (parallelized):
pnpm generate

# Build + run the CodSpeed harness locally (no CodSpeed cloud uploads):
pnpm codspeed
```

`pnpm dev` automatically runs `pnpm generate` first, so the benchmark sources are always fresh.

## How a benchmark is wired

Every benchmark has the same three layers:

1. **`codspeed/<case>/gen.ts`** builds a TSX source string for both libraries and hands it to `writeBenchmarkSource()`. The helper writes the source verbatim and, for `next-yak`, also runs the source through the SWC plugin to produce a `.compiled.tsx` (mimicking what the `withYak` loader does at app build time, since the bench harness has no loader).

2. **`codspeed/index.bench.tsx`** imports the `.compiled.tsx` (yak) and `.tsx` (sc) outputs, registers each as a `Benchmark.Suite` case, and feeds the suite to `withCodSpeed`. CodSpeed's GitHub Action measures CPU instructions per iteration; locally, falling back to benchmark.js gives wall-clock ops/sec.

3. **`app/codspeed/[slug]/page.tsx`** imports the _non-compiled_ `.tsx` outputs and renders them in the browser, so the real `withYak` webpack loader path is exercised. This is useful for checking that what the bench is measuring matches what would ship to a real Next.js app.

## Adding a new benchmark

1. Create `codspeed/<case>/gen.ts` (copy any existing one as a template; most boilerplate lives in `_shared.ts`).
2. Add a `generate:codspeed:<case>` script to `package.json` — `pnpm generate` picks it up automatically via the `^generate:codspeed:` regex.
3. Add the import + `.add("render <Name>Yak/Styled", () => …)` calls in `codspeed/index.bench.tsx`.
4. Add an entry to `app/codspeed/manifest.ts` and the `components` map in `app/codspeed/[slug]/page.tsx` so the demo viewer can render it.

## Variance & fairness notes

- `minSamples: 50` on the suite to keep iteration counts stable across runs (CodSpeed reads them).
- For each library we use _its_ idiomatic build-time-extracted form. Mixing them produces meaningless numbers. See `codspeed/css-prop/gen.ts` for the spelled-out reasoning.
- The `Idiomatic*` benchmarks (e.g. `IdiomaticTree`) pair with their CSS-variable counterparts (`Tree`) to isolate the cost of CSS-variable emission vs class-toggle composition.
