import { globalStyles } from "next-yak/internal";
import "data:text/css;base64,Omdsb2JhbCgubWFwcykgewogIGJvcmRlcjogMXB4IHNvbGlkIGJsYWNrOwp9";
// Markup rendered by third-party code (map widgets, markdown, CMS content)
// ships fixed class names. On Next.js with webpack, CSS Modules would hash
// them, so wrap them in `:global()` to keep them intact — css-loader unwraps
// it downstream. Other bundlers don't scope class names and need no wrapper.
/*YAK Extracted CSS:
:global(.maps) {
  border: 1px solid black;
}
*/ /*#__PURE__*/ globalStyles();
