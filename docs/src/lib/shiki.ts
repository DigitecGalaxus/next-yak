import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import css from "shiki/langs/css.mjs";
import tsx from "shiki/langs/tsx.mjs";
// `styled` injects `cssStyled` into styled/css template literals. Files are named for each grammar's scopeName.
import styled from "./langs/styled";
import cssStyled from "./langs/css-styled";
import { yakTheme } from "./yak-theme";

export const highlighterPromise = createHighlighterCore({
  themes: [yakTheme],
  // Monaco type-checks only the `typescript` language id, so the tsx grammar serves that id too.
  langs: [{ ...tsx[0], aliases: ["typescript", "ts"] }, css, styled, cssStyled],
  // `forgiving` keeps Safari's RegExp engine happy with these grammars.
  engine: createJavaScriptRegexEngine({ forgiving: true }),
});

export const highlightPromise = highlighterPromise.then(
  (highlighter) => (code: string, lang: "tsx" | "ts" | "css") =>
    highlighter.codeToHtml(code, { lang, theme: yakTheme.name }),
);
