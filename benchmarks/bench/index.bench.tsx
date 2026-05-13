import Benchmark from "benchmark";
import { readFileSync, writeFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { ServerStyleSheet } from "styled-components";
import { KanjiLetterComponentYak } from "./generated/KanjiLetterComponent.next-yak.compiled";
import React from "react";
import { KanjiLetterComponentStyled } from "./generated/KanjiLetterComponent.styled-components";

// Pure Components
import { PureComponentsYak } from "./generated/PureComponents.next-yak.compiled";
import { PureComponentsStyled } from "./generated/PureComponents.styled-components";

// Attrs Components
import { AttrsComponentsYak } from "./generated/AttrsComponents.next-yak.compiled";
import { AttrsComponentsStyled } from "./generated/AttrsComponents.styled-components";

// CSS Prop Components
import { CssPropComponentsYak } from "./generated/CssPropComponents.next-yak.compiled";
import { CssPropComponentsStyled } from "./generated/CssPropComponents.styled-components";

// Dynamic Props Components
import { DynamicPropsComponentsYak } from "./generated/DynamicPropsComponents.next-yak.compiled";
import { DynamicPropsComponentsStyled } from "./generated/DynamicPropsComponents.styled-components";

// Nested Components
import { NestedComponentsYak } from "./generated/NestedComponents.next-yak.compiled";
import { NestedComponentsStyled } from "./generated/NestedComponents.styled-components";

// Industry-standard benchmarks (ported from styled-components):
//   https://github.com/styled-components/styled-components/tree/main/packages/benchmarks/src/cases
import { TreeYak } from "./generated/Tree.next-yak.compiled";
import { TreeStyled } from "./generated/Tree.styled-components";
import { SierpinskiYak } from "./generated/Sierpinski.next-yak.compiled";
import { SierpinskiStyled } from "./generated/Sierpinski.styled-components";
import {
  CrossRequestCacheYak,
  RENDER_COUNT as CROSS_REQUEST_CACHE_COUNT,
} from "./generated/CrossRequestCache.next-yak.compiled";
import { CrossRequestCacheStyled } from "./generated/CrossRequestCache.styled-components";

// Tree shape extremes
import { TreeDeepYak } from "./generated/TreeDeep.next-yak.compiled";
import { TreeDeepStyled } from "./generated/TreeDeep.styled-components";
import { TreeWideYak } from "./generated/TreeWide.next-yak.compiled";
import { TreeWideStyled } from "./generated/TreeWide.styled-components";

// Idiomatic-yak rewrites
import { IdiomaticTreeYak } from "./generated/IdiomaticTree.next-yak.compiled";
import { IdiomaticTreeStyled } from "./generated/IdiomaticTree.styled-components";
import { IdiomaticDynamicPropsComponentsYak } from "./generated/IdiomaticDynamicProps.next-yak.compiled";
import { IdiomaticDynamicPropsComponentsStyled } from "./generated/IdiomaticDynamicProps.styled-components";

// Each row pairs the styled-components and next-yak variants of one workload.
// Order here is the order rendered in the output table.
const ROWS: Array<{ label: string; styled: string; yak: string }> = [
  {
    label: "Kanji letter",
    styled: "render KanjiLetterComponentStyled",
    yak: "render KanjiLetterComponentYak",
  },
  {
    label: "Pure component",
    styled: "render PureComponentsStyled",
    yak: "render PureComponentsYak",
  },
  {
    label: "Attrs",
    styled: "render AttrsComponentsStyled",
    yak: "render AttrsComponentsYak",
  },
  {
    label: "CSS prop",
    styled: "render CssPropComponentsStyled",
    yak: "render CssPropComponentsYak",
  },
  {
    label: "Dynamic props",
    styled: "render DynamicPropsComponentsStyled",
    yak: "render DynamicPropsComponentsYak",
  },
  {
    label: "Dynamic props (idiomatic)",
    styled: "render IdiomaticDynamicPropsStyled",
    yak: "render IdiomaticDynamicPropsYak",
  },
  {
    label: "Nested components",
    styled: "render NestedComponentsStyled",
    yak: "render NestedComponentsYak",
  },
  { label: "Tree", styled: "render TreeStyled", yak: "render TreeYak" },
  {
    label: "Tree (idiomatic)",
    styled: "render IdiomaticTreeStyled",
    yak: "render IdiomaticTreeYak",
  },
  {
    label: "Tree deep",
    styled: "render TreeDeepStyled",
    yak: "render TreeDeepYak",
  },
  {
    label: "Tree wide",
    styled: "render TreeWideStyled",
    yak: "render TreeWideYak",
  },
  {
    label: "Sierpinski",
    styled: "render SierpinskiStyled",
    yak: "render SierpinskiYak",
  },
  {
    label: "Cross request cache",
    styled: "render CrossRequestCacheStyled",
    yak: "render CrossRequestCacheYak",
  },
  {
    label: "SSR extraction",
    styled: "render SsrExtractionStyled",
    yak: "render SsrExtractionYak",
  },
];

const results = new Map<string, number>();

function loadBaseline(): Map<string, number> | undefined {
  const file = process.env.BENCH_BASELINE_FILE;
  if (!file) return undefined;
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8")) as Record<string, number>;
    const entries = Object.entries(parsed).filter(
      ([, v]) => typeof v === "number" && Number.isFinite(v) && v > 0,
    );
    if (entries.length === 0) return undefined;
    return new Map(entries);
  } catch (e) {
    console.warn(`Failed to read baseline file ${file}: ${(e as Error).message}`);
    return undefined;
  }
}

function renderTable(baseline: Map<string, number> | undefined): string {
  const lines = [
    "<table>",
    "<tr>",
    " <td>Benchmark",
    " <td>styled-components (ops/sec)",
    " <td>next-yak (ops/sec)",
    " <td>next yak is",
  ];
  if (baseline) lines.push(" <td>Δ next-yak vs main");

  for (const row of ROWS) {
    const styled = results.get(row.styled);
    const yak = results.get(row.yak);
    lines.push("<tr>");
    lines.push(` <td>${row.label}`);
    lines.push(` <td> ${styled === undefined ? "n/a" : Math.round(styled)}`);
    lines.push(` <td> ${yak === undefined ? "n/a" : Math.round(yak)}`);

    let comparison = "n/a";
    if (styled !== undefined && yak !== undefined && styled > 0 && yak > 0) {
      if (yak >= styled) {
        const pct = parseFloat((((yak - styled) / styled) * 100).toFixed(2));
        comparison = `${pct}% faster`;
      } else {
        const pct = parseFloat((((styled - yak) / yak) * 100).toFixed(2));
        comparison = `${pct}% slower`;
      }
    }
    lines.push(` <td> ${comparison}`);

    if (baseline) {
      let delta = "—";
      const baseYak = baseline.get(row.yak);
      if (yak !== undefined && baseYak !== undefined && baseYak > 0 && yak > 0) {
        if (yak >= baseYak) {
          const pct = parseFloat((((yak - baseYak) / baseYak) * 100).toFixed(2));
          delta = `${pct}% faster`;
        } else {
          const pct = parseFloat((((baseYak - yak) / yak) * 100).toFixed(2));
          delta = `${pct}% slower`;
        }
      } else if (yak !== undefined && baseYak === undefined) {
        delta = "new";
      }
      lines.push(` <td> ${delta}`);
    }
  }

  lines.push("</table>");
  return lines.join("\n");
}

(async () => {
  const suite = new Benchmark.Suite(undefined, { minSamples: 50 });

  suite
    // Original Kanji Letter Components
    .add("render KanjiLetterComponentStyled", () => {
      renderToString(<KanjiLetterComponentStyled />).length;
    })
    .add("render KanjiLetterComponentYak", () => {
      renderToString(<KanjiLetterComponentYak />).length;
    })

    // Pure Components (1000 basic styled components)
    .add("render PureComponentsStyled", () => {
      renderToString(<PureComponentsStyled />).length;
    })
    .add("render PureComponentsYak", () => {
      renderToString(<PureComponentsYak />).length;
    })

    // Attrs Components (1000 components with .attrs())
    .add("render AttrsComponentsStyled", () => {
      renderToString(<AttrsComponentsStyled />).length;
    })
    .add("render AttrsComponentsYak", () => {
      renderToString(<AttrsComponentsYak />).length;
    })

    // CSS Prop Components (1000 css prop usage)
    .add("render CssPropComponentsStyled", () => {
      renderToString(<CssPropComponentsStyled />).length;
    })
    .add("render CssPropComponentsYak", () => {
      renderToString(<CssPropComponentsYak />).length;
    })

    // Dynamic Props Components (1000 components with dynamic styling)
    .add("render DynamicPropsComponentsStyled", () => {
      renderToString(<DynamicPropsComponentsStyled />).length;
    })
    .add("render DynamicPropsComponentsYak", () => {
      renderToString(<DynamicPropsComponentsYak />).length;
    })

    // Nested Components (200 components with 5 levels of inheritance)
    .add("render NestedComponentsStyled", () => {
      renderToString(<NestedComponentsStyled />).length;
    })
    .add("render NestedComponentsYak", () => {
      renderToString(<NestedComponentsYak />).length;
    })

    // Tree mount (industry-standard)
    .add("render TreeStyled", () => {
      renderToString(<TreeStyled />).length;
    })
    .add("render TreeYak", () => {
      renderToString(<TreeYak />).length;
    })

    // Sierpinski Triangle (industry-standard, dynamic per-instance styles)
    .add("render SierpinskiStyled", () => {
      renderToString(<SierpinskiStyled />).length;
    })
    .add("render SierpinskiYak", () => {
      renderToString(<SierpinskiYak />).length;
    })

    // Cross-request cache: six sequential SSR mounts with stable child props.
    .add("render CrossRequestCacheStyled", () => {
      for (let i = 0; i < CROSS_REQUEST_CACHE_COUNT; i++) {
        renderToString(<CrossRequestCacheStyled count={i} />).length;
      }
    })
    .add("render CrossRequestCacheYak", () => {
      for (let i = 0; i < CROSS_REQUEST_CACHE_COUNT; i++) {
        renderToString(<CrossRequestCacheYak count={i} />).length;
      }
    })

    // Tree shape extremes: deep recursion vs wide sibling fan-out.
    // Both shapes are ~1.5k boxes; the difference is React render depth.
    .add("render TreeDeepStyled", () => {
      renderToString(<TreeDeepStyled />).length;
    })
    .add("render TreeDeepYak", () => {
      renderToString(<TreeDeepYak />).length;
    })
    .add("render TreeWideStyled", () => {
      renderToString(<TreeWideStyled />).length;
    })
    .add("render TreeWideYak", () => {
      renderToString(<TreeWideYak />).length;
    })

    // Idiomatic-yak Tree: same workload as Tree, finite-enum props as class toggles.
    .add("render IdiomaticTreeStyled", () => {
      renderToString(<IdiomaticTreeStyled />).length;
    })
    .add("render IdiomaticTreeYak", () => {
      renderToString(<IdiomaticTreeYak />).length;
    })

    // Idiomatic-yak DynamicProps: same workload as DynamicPropsComponents,
    // every $primary/$size/$variant/$disabled branch is a class toggle.
    .add("render IdiomaticDynamicPropsStyled", () => {
      renderToString(<IdiomaticDynamicPropsComponentsStyled />).length;
    })
    .add("render IdiomaticDynamicPropsYak", () => {
      renderToString(<IdiomaticDynamicPropsComponentsYak />).length;
    })

    // SSR with critical-CSS extraction. Each iteration produces what the
    // browser actually needs to paint: HTML *and* the CSS payload.
    .add("render SsrExtractionStyled", () => {
      const sheet = new ServerStyleSheet();
      try {
        renderToString(sheet.collectStyles(<PureComponentsStyled />)).length;
        sheet.getStyleTags().length;
      } finally {
        sheet.seal();
      }
    })
    .add("render SsrExtractionYak", () => {
      renderToString(<PureComponentsYak />).length;
    })

    .on("cycle", function (event: Benchmark.Event) {
      const target = event.target as Benchmark.Target & {
        name: string;
        hz: number;
      };
      results.set(target.name, target.hz);
      console.log(String(target));
    });

  // Benchmark.Suite.run() does not return a Promise even with `async: true`,
  // so we wait on the `complete` event explicitly.
  await new Promise<void>((resolve) => {
    suite.on("complete", () => resolve());
    suite.run({ async: true });
  });

  const baseline = loadBaseline();
  const table = renderTable(baseline);
  console.log("\n" + table);

  const outFile = process.env.BENCH_OUTPUT_FILE;
  if (outFile) {
    writeFileSync(outFile, table + "\n");
  }
})();
