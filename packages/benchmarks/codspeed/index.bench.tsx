import Benchmark from "benchmark";
import { withCodSpeed } from "@codspeed/benchmark.js-plugin";
import { renderToString } from "react-dom/server";
import { KanjiLetterComponentYak } from "../letters/KanjiLetterComponent.next-yak.compiled";
import React from "react";
import { KanjiLetterComponentStyled } from "../letters/KanjiLetterComponent.styled-components";

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

(async () => {
  const suite = withCodSpeed(new Benchmark.Suite());

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

    .on("cycle", function (event: Benchmark.Event) {
      console.log(String(event.target));
    });

  await suite.run({ async: true });
})();
