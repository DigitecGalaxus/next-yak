import { css, __yak_mergeCssProp } from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
// With foldStatic off, a statically known css prop keeps the runtime path
// instead of folding into a plain className.
const Static = ()=><div {...__yak_mergeCssProp({}, /*YAK Extracted CSS:
:global(.input_Static_m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ css("input_Static_m7uBBu"))}/>;
// A className stays a runtime mergeCssProp call rather than a folded string.
const WithClassName = ()=><div {...__yak_mergeCssProp({
        className: "static"
    }, /*YAK Extracted CSS:
:global(.input_WithClassName_m7uBBu) {
  color: blue;
}
*/ /*#__PURE__*/ css("input_WithClassName_m7uBBu"))}/>;
// A conditional css prop keeps the runtime path instead of folding into a
// className expression.
const Conditional = ({ on }: {
    on: boolean;
})=><div {...__yak_mergeCssProp({}, /*YAK Extracted CSS:
:global(.input_Conditional__on_m7uBBu) {
  color: red;
}
:global(.input_Conditional__not_on_m7uBBu) {
  color: blue;
}
*/ /*#__PURE__*/ css(()=>on ? /*#__PURE__*/ css("input_Conditional__on_m7uBBu") : /*#__PURE__*/ css("input_Conditional__not_on_m7uBBu"), "input_Conditional_m7uBBu"))}/>;
