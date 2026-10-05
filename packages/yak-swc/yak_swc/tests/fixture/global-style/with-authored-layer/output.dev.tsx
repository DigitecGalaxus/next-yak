import { globalStyle } from "@yak/react/internal";
import "./input.yak.css!=!./input?./input.yak.css";
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
*/ /*#__PURE__*/ globalStyle();
