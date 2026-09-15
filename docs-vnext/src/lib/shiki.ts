import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import css from "shiki/langs/css.mjs";
import tsx from "shiki/langs/tsx.mjs";
import ts from "shiki/langs/typescript.mjs";
// `styled` is the styled-components JS injection grammar (scopeName "styled"); it embeds
// `cssStyled`, the CSS grammar matched inside the template literals (scopeName
// "source.css.styled"). Each file is named for the grammar's scopeName.
import styled from "./langs/styled";
import cssStyled from "./langs/css-styled";
import { yakTheme } from "./yak-theme";

export { yakTheme };

// Singleton highlighter: tsx + the styled-components injection grammar so CSS inside
// `styled\`…\`` / `css\`…\`` template literals is highlighted per-property.
export const highlighterPromise = createHighlighterCore({
  themes: [yakTheme],
  langs: [tsx, ts, css, styled, cssStyled],
  // `forgiving` keeps Safari's RegExp engine happy with these grammars.
  engine: createJavaScriptRegexEngine({ forgiving: true }),
});
