import Benchmark from "benchmark";
import { withCodSpeed } from "@codspeed/benchmark.js-plugin";
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

(async () => {
  const suite = withCodSpeed(new Benchmark.Suite(undefined, { minSamples: 50 }));

  suite
    // Original Kanji Letter Components
    .add("render KanjiLetterComponentStyled", () => {
      try {
        renderToString(<KanjiLetterComponentStyled />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })
    .add("render KanjiLetterComponentYak", () => {
      try {
        renderToString(<KanjiLetterComponentYak />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })

    // Pure Components (1000 basic styled components)
    .add("render PureComponentsStyled", () => {
      try {
        renderToString(<PureComponentsStyled />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })
    .add("render PureComponentsYak", () => {
      try {
        renderToString(<PureComponentsYak />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })

    // Attrs Components (1000 components with .attrs())
    .add("render AttrsComponentsStyled", () => {
      try {
        renderToString(<AttrsComponentsStyled />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })
    .add("render AttrsComponentsYak", () => {
      try {
        renderToString(<AttrsComponentsYak />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })

    // CSS Prop Components (1000 css prop usage)
    .add("render CssPropComponentsStyled", () => {
      try {
        renderToString(<CssPropComponentsStyled />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })
    .add("render CssPropComponentsYak", () => {
      try {
        renderToString(<CssPropComponentsYak />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })

    // Dynamic Props Components (1000 components with dynamic styling)
    .add("render DynamicPropsComponentsStyled", () => {
      try {
        renderToString(<DynamicPropsComponentsStyled />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })
    .add("render DynamicPropsComponentsYak", () => {
      try {
        renderToString(<DynamicPropsComponentsYak />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })

    // Nested Components (200 components with 5 levels of inheritance)
    .add("render NestedComponentsStyled", () => {
      try {
        renderToString(<NestedComponentsStyled />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })
    .add("render NestedComponentsYak", () => {
      try {
        renderToString(<NestedComponentsYak />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })

    // Tree mount (industry-standard)
    .add("render TreeStyled", () => {
      try {
        renderToString(<TreeStyled />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })
    .add("render TreeYak", () => {
      try {
        renderToString(<TreeYak />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })

    // Sierpinski Triangle (industry-standard, dynamic per-instance styles)
    .add("render SierpinskiStyled", () => {
      try {
        renderToString(<SierpinskiStyled />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })
    .add("render SierpinskiYak", () => {
      try {
        renderToString(<SierpinskiYak />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })

    // Cross-request cache: six sequential SSR mounts with stable child props.
    .add("render CrossRequestCacheStyled", () => {
      try {
        for (let i = 0; i < CROSS_REQUEST_CACHE_COUNT; i++) {
          renderToString(<CrossRequestCacheStyled count={i} />).length;
        }
      } catch (e) {
        console.error(e);
        throw e;
      }
    })
    .add("render CrossRequestCacheYak", () => {
      try {
        for (let i = 0; i < CROSS_REQUEST_CACHE_COUNT; i++) {
          renderToString(<CrossRequestCacheYak count={i} />).length;
        }
      } catch (e) {
        console.error(e);
        throw e;
      }
    })

    // Tree shape extremes: deep recursion vs wide sibling fan-out.
    // Both shapes are ~1.5k boxes; the difference is React render depth.
    .add("render TreeDeepStyled", () => {
      try {
        renderToString(<TreeDeepStyled />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })
    .add("render TreeDeepYak", () => {
      try {
        renderToString(<TreeDeepYak />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })
    .add("render TreeWideStyled", () => {
      try {
        renderToString(<TreeWideStyled />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })
    .add("render TreeWideYak", () => {
      try {
        renderToString(<TreeWideYak />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })

    // Idiomatic-yak Tree: same workload as Tree, finite-enum props as class toggles.
    .add("render IdiomaticTreeStyled", () => {
      try {
        renderToString(<IdiomaticTreeStyled />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })
    .add("render IdiomaticTreeYak", () => {
      try {
        renderToString(<IdiomaticTreeYak />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })

    // Idiomatic-yak DynamicProps: same workload as DynamicPropsComponents,
    // every $primary/$size/$variant/$disabled branch is a class toggle.
    .add("render IdiomaticDynamicPropsStyled", () => {
      try {
        renderToString(<IdiomaticDynamicPropsComponentsStyled />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })
    .add("render IdiomaticDynamicPropsYak", () => {
      try {
        renderToString(<IdiomaticDynamicPropsComponentsYak />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })

    // SSR with critical-CSS extraction. Each iteration produces what the
    // browser actually needs to paint: HTML *and* the CSS payload.
    .add("render SsrExtractionStyled", () => {
      try {
        const sheet = new ServerStyleSheet();
        try {
          renderToString(sheet.collectStyles(<PureComponentsStyled />)).length;
          sheet.getStyleTags().length;
        } finally {
          sheet.seal();
        }
      } catch (e) {
        console.error(e);
        throw e;
      }
    })
    .add("render SsrExtractionYak", () => {
      try {
        renderToString(<PureComponentsYak />).length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    })

    .on("cycle", function (event: Benchmark.Event) {
      console.log(String(event.target));
    });

  await suite.run({ async: true });
})();
