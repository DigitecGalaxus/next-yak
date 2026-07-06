import { css, __yak_use, __yak_mergeCssProp } from "next-yak/internal";
// @ts-ignore
import { highlight } from "./highlight";
import "data:text/css;base64,LmlucHV0X1RleHRfbTd1QkJ1IHsKICBwYWRkaW5nOiA0cHg7CiAgLS15YWstY3NzLWltcG9ydDogdXJsKCIuL2hpZ2hsaWdodDpoaWdobGlnaHQiLG1peGluLCJpbnB1dF9UZXh0X19oaWdobGlnaHRfbTd1QkJ1Iik7Cn0=";
// A cross-file mixin used inside a css prop: the marker gets a usage-site
// scope prefix and the imported value is passed through __yak_use exactly
// like in a styled component
export const Text = ()=><p {...__yak_mergeCssProp({}, /*YAK Extracted CSS:
.input_Text_m7uBBu {
  padding: 4px;
  --yak-css-import: url("./highlight:highlight",mixin,"input_Text__highlight_m7uBBu");
}
*/ /*#__PURE__*/ css(__yak_use(highlight, "input_Text__highlight_m7uBBu"), "input_Text_m7uBBu"))}>
    hello
  </p>;
