import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import css from "shiki/langs/css.mjs";
import tsx from "shiki/langs/tsx.mjs";
import ts from "shiki/langs/typescript.mjs";
import vitesseDark from "shiki/themes/vitesse-dark.mjs";
import vitesseLight from "shiki/themes/vitesse-light.mjs";
import cssStyled from "./langs/css-styled";
import styled from "./langs/styled";

export const highlighterPromise = createHighlighterCore({
  themes: [vitesseLight, vitesseDark],
  langs: [tsx, ts, css, cssStyled, styled],
  // forgiving is set for safari, as the RegExp engine is not fully compatible with Safari's RegExp implementation
  engine: createJavaScriptRegexEngine({ forgiving: true }),
});
