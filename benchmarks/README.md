# benchmarks

Two suites live here:

1. **Runtime benchmarks** under `bench/`. Run on every PR via the [`benchmarks`](../.github/workflows/benchmarks.yml) workflow to catch render-time regressions in the `next-yak` runtime, and to compare against `styled-components` head-to-head on identical workloads. The workflow upserts a single PR comment with the latest results.
2. **Interactive Next.js demo viewer** under `app/`. The same generated benchmark components, rendered in a real Next.js dev server so you can inspect the DOM, classes, and CSS that each library actually produces.

## Running

```bash
# Browse benchmarks in dev mode (also runs all generators first):
pnpm dev          # http://localhost:3000
pnpm dev:turbo    # same, but Turbopack instead of Webpack

# Regenerate just the source files (parallelized):
pnpm generate

# Build + run the benchmark harness locally and print an HTML results table:
pnpm bench
```

`pnpm dev` automatically runs `pnpm generate` first, so the benchmark sources are always fresh.

To capture the HTML table to a file (the CI workflow does this so it can post it as a PR comment):

```bash
BENCH_OUTPUT_FILE=./bench-table.html pnpm bench
```

## How a benchmark is wired

Every benchmark has the same three layers:

1. **`bench/<case>/gen.ts`** builds a TSX source string for both libraries and hands it to `writeBenchmarkSource()`. The helper writes the source verbatim and, for `next-yak`, also runs the source through the SWC plugin to produce a `.compiled.tsx` (mimicking what the `withYak` loader does at app build time, since the bench harness has no loader).

2. **`bench/index.bench.tsx`** imports the `.compiled.tsx` (yak) and `.tsx` (sc) outputs, registers each as a `Benchmark.Suite` case, and at the end pairs the styled-components and next-yak variants of each workload into the HTML results table.

3. **`app/bench/[slug]/page.tsx`** imports the _non-compiled_ `.tsx` outputs and renders them in the browser, so the real `withYak` webpack loader path is exercised. This is useful for checking that what the bench is measuring matches what would ship to a real Next.js app.

## Adding a new benchmark

1. Create `bench/<case>/gen.ts` (copy any existing one as a template; most boilerplate lives in `_shared.ts`).
2. Add a `generate:bench:<case>` script to `package.json` — `pnpm generate` picks it up automatically via the `^generate:bench:` regex.
3. Add the import + `.add("render <Name>Yak/Styled", () => …)` calls in `bench/index.bench.tsx`, and add a row to the `ROWS` table at the top of the same file so it shows up in the results.
4. Add an entry to `app/bench/manifest.ts` and the `components` map in `app/bench/[slug]/page.tsx` so the demo viewer can render it.

## Variance & fairness notes

- `minSamples: 50` on the suite to keep iteration counts stable across runs.
- For each library we use _its_ idiomatic build-time-extracted form. Mixing them produces meaningless numbers. See `bench/css-prop/gen.ts` for the spelled-out reasoning.
- The `Idiomatic*` benchmarks (e.g. `IdiomaticTree`) pair with their CSS-variable counterparts (`Tree`) to isolate the cost of CSS-variable emission vs class-toggle composition.
- The workflow runs on shared GitHub Actions runners, which are noisy. Treat large swings as signal and single-digit deltas as noise.
