import { globalCss } from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
// Styling markup rendered by third-party code (map widgets, markdown, CMS
// content) — the class name is a fixed contract, it must never be hashed.
// `:global(...)` is the portable form: css-loader unwraps it on webpack and
// yak unwraps it for native CSS pipelines, so the same source works everywhere.
/*YAK Extracted CSS:
:global(.maps) {
  border: 1px solid black;
}
:global(.legacy-widget:has(.icon)) {
  color: red;
}
*/ /*#__PURE__*/ globalCss();
