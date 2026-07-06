import { css, __yak_use, __yak_mergeCssProp } from "next-yak/internal";
// @ts-ignore
import { highlight } from "./highlight";
import "data:text/css;base64,LnltN3VCQnUgewogIHBhZGRpbmc6IDRweDsKICAtLXlhay1jc3MtaW1wb3J0OiB1cmwoIi4vaGlnaGxpZ2h0OmhpZ2hsaWdodCIsbWl4aW4sInltN3VCQnUxIik7Cn0=";
// A cross-file mixin used inside a css prop: the marker gets a usage-site
// scope prefix and the imported value is passed through __yak_use exactly
// like in a styled component
export const Text = ()=><p {...__yak_mergeCssProp({}, /*YAK Extracted CSS:
.ym7uBBu {
  padding: 4px;
  --yak-css-import: url("./highlight:highlight",mixin,"ym7uBBu1");
}
*/ /*#__PURE__*/ css(__yak_use(highlight, "ym7uBBu1"), "ym7uBBu"))}>
    hello
  </p>;
