import { globalCss } from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
// Cascade layers are not added automatically — users opt in by authoring
// @layer themselves; the at-rule passes through verbatim.
/*YAK Extracted CSS:
@layer base {
  body {
    margin: 0;
  }
  input:focus-visible {
    outline: 2px solid rebeccapurple;
  }
}
*/ /*#__PURE__*/ globalCss();
