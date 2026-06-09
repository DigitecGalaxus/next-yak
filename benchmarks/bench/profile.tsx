import { renderToString } from "react-dom/server";
import React from "react";

// Single-case SSR profiling runner. Renders one benchmark case in a loop so
// `node --cpu-prof` / `--heap-prof` can attribute time/allocations to runtime
// functions. Build UNMINIFIED via `pnpm bench:profile:build` (the regular
// bench bundle is minified, which destroys frame attribution), then:
//
//   node --cpu-prof --cpu-prof-dir=./bench/profiles ./bench/dist-profile/profile.mjs <case> [iterations]
//   node --heap-prof --heap-prof-dir=./bench/profiles ./bench/dist-profile/profile.mjs <case> [iterations]
//
// Analyze with `node ./bench/analyze-cpuprofile.mjs ./bench/profiles/<file>.cpuprofile`.

import { PureComponentsYak } from "./generated/PureComponents.next-yak.compiled";
import { PureComponentsStyled } from "./generated/PureComponents.styled-components";
import { PureComponentsVanilla } from "./generated/PureComponents.vanilla";
import { NestedComponentsYak } from "./generated/NestedComponents.next-yak.compiled";
import { NestedComponentsStyled } from "./generated/NestedComponents.styled-components";
import { NestedComponentsVanilla } from "./generated/NestedComponents.vanilla";
import { DynamicPropsComponentsYak } from "./generated/DynamicPropsComponents.next-yak.compiled";
import { DynamicPropsComponentsStyled } from "./generated/DynamicPropsComponents.styled-components";
import { DynamicPropsComponentsVanilla } from "./generated/DynamicPropsComponents.vanilla";
import { TreeYak } from "./generated/Tree.next-yak.compiled";
import { TreeStyled } from "./generated/Tree.styled-components";
import { TreeVanilla } from "./generated/Tree.vanilla";
import { TreeDeepYak } from "./generated/TreeDeep.next-yak.compiled";
import { TreeDeepStyled } from "./generated/TreeDeep.styled-components";
import { TreeDeepVanilla } from "./generated/TreeDeep.vanilla";
import { TreeWideYak } from "./generated/TreeWide.next-yak.compiled";
import { TreeWideStyled } from "./generated/TreeWide.styled-components";
import { TreeWideVanilla } from "./generated/TreeWide.vanilla";
import {
  CrossRequestCacheYak,
  RENDER_COUNT as CROSS_REQUEST_CACHE_COUNT,
} from "./generated/CrossRequestCache.next-yak.compiled";
import { CrossRequestCacheStyled } from "./generated/CrossRequestCache.styled-components";
import { CrossRequestCacheVanilla } from "./generated/CrossRequestCache.vanilla";

type Case = { render: () => void };

const crossRequest = (Component: React.FunctionComponent<{ count: number }>) => () => {
  for (let i = 0; i < CROSS_REQUEST_CACHE_COUNT; i++) {
    renderToString(<Component count={i} />).length;
  }
};
const simple = (Component: React.FunctionComponent) => () => {
  renderToString(<Component />).length;
};

const CASES: Record<string, Case> = {
  "pure-yak": { render: simple(PureComponentsYak) },
  "pure-styled": { render: simple(PureComponentsStyled) },
  "pure-vanilla": { render: simple(PureComponentsVanilla) },
  "nested-yak": { render: simple(NestedComponentsYak) },
  "nested-styled": { render: simple(NestedComponentsStyled) },
  "nested-vanilla": { render: simple(NestedComponentsVanilla) },
  "dynamic-yak": { render: simple(DynamicPropsComponentsYak) },
  "dynamic-styled": { render: simple(DynamicPropsComponentsStyled) },
  "dynamic-vanilla": { render: simple(DynamicPropsComponentsVanilla) },
  "tree-yak": { render: simple(TreeYak) },
  "tree-styled": { render: simple(TreeStyled) },
  "tree-vanilla": { render: simple(TreeVanilla) },
  "tree-deep-yak": { render: simple(TreeDeepYak) },
  "tree-deep-styled": { render: simple(TreeDeepStyled) },
  "tree-deep-vanilla": { render: simple(TreeDeepVanilla) },
  "tree-wide-yak": { render: simple(TreeWideYak) },
  "tree-wide-styled": { render: simple(TreeWideStyled) },
  "tree-wide-vanilla": { render: simple(TreeWideVanilla) },
  "cross-request-yak": { render: crossRequest(CrossRequestCacheYak) },
  "cross-request-styled": { render: crossRequest(CrossRequestCacheStyled) },
  "cross-request-vanilla": { render: crossRequest(CrossRequestCacheVanilla) },
};

const caseName = process.argv[2];
const iterations = Number(process.argv[3] ?? 300);
const benchCase = CASES[caseName];
if (!benchCase) {
  console.error(`Unknown case "${caseName}". Available:\n  ${Object.keys(CASES).join("\n  ")}`);
  process.exit(1);
}

// Warmup so the profile captures steady-state (tiered-up) code, matching
// what benchmark.js measures.
const WARMUP = Math.min(50, Math.ceil(iterations / 5));
for (let i = 0; i < WARMUP; i++) benchCase.render();

const start = process.hrtime.bigint();
for (let i = 0; i < iterations; i++) benchCase.render();
const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;

console.log(
  `${caseName}: ${iterations} iterations in ${elapsedMs.toFixed(0)}ms (${((iterations / elapsedMs) * 1000).toFixed(1)} ops/sec)`,
);
