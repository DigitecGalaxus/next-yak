import { css, __yak_use, __yak_mergeCssProp } from "next-yak/internal";
// @ts-ignore
import { highlight } from "./highlight";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
// A cross-file mixin used inside a css prop: the marker gets a usage-site
// scope prefix and the imported value is passed through __yak_use exactly
// like in a styled component
export const Text = ()=><p {...__yak_mergeCssProp({}, /*YAK Extracted CSS:
:global(.ym7uBBu) {
  padding: 4px;
  --yak-css-import: url("./highlight:highlight",mixin,"ym7uBBu1");
}
*/ /*#__PURE__*/ css(__yak_use(highlight, "ym7uBBu1"), "ym7uBBu"))}>
    hello
  </p>;
