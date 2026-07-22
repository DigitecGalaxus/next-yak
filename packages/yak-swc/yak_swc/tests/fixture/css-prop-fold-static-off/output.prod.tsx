import { css, __yak_mergeCssProp } from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
// With foldStatic off, a statically known css prop keeps the runtime path
// instead of folding into a plain className.
const Static = ()=><div {...__yak_mergeCssProp({}, /*YAK Extracted CSS:
:global(.ym7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ css("ym7uBBu"))}/>;
// A className stays a runtime mergeCssProp call rather than a folded string.
const WithClassName = ()=><div {...__yak_mergeCssProp({
        className: "static"
    }, /*YAK Extracted CSS:
:global(.ym7uBBu1) {
  color: blue;
}
*/ /*#__PURE__*/ css("ym7uBBu1"))}/>;
// A conditional css prop keeps the runtime path instead of folding into a
// className expression.
const Conditional = ({ on }: {
    on: boolean;
})=><div {...__yak_mergeCssProp({}, /*YAK Extracted CSS:
:global(.ym7uBBu3) {
  color: red;
}
:global(.ym7uBBu4) {
  color: blue;
}
*/ /*#__PURE__*/ css(()=>on ? /*#__PURE__*/ css("ym7uBBu3") : /*#__PURE__*/ css("ym7uBBu4"), "ym7uBBu2"))}/>;
