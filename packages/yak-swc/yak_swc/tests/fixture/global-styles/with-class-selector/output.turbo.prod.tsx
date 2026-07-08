import { globalCss } from "next-yak/internal";
import "data:text/css;base64,Lm1hcHMgewogIGJvcmRlcjogMXB4IHNvbGlkIGJsYWNrOwp9Ci5sZWdhY3ktd2lkZ2V0OmhhcyguaWNvbikgewogIGNvbG9yOiByZWQ7Cn0=";
// Styling markup rendered by third-party code (map widgets, markdown, CMS
// content) — the class name is a fixed contract, it must never be hashed.
// `:global(...)` is the portable form: css-loader unwraps it on webpack and
// yak unwraps it for native CSS pipelines, so the same source works everywhere.
/*YAK Extracted CSS:
.maps {
  border: 1px solid black;
}
.legacy-widget:has(.icon) {
  color: red;
}
*/ /*#__PURE__*/ globalCss();
