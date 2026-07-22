import { css, __yak_mergeCssProp } from "next-yak/internal";
import "data:text/css;base64,LmlucHV0X1N0YXRpY19tN3VCQnUgewogIGNvbG9yOiByZWQ7Cn0uaW5wdXRfV2l0aENsYXNzTmFtZV9tN3VCQnUgewogIGNvbG9yOiBibHVlOwp9LmlucHV0X0NvbmRpdGlvbmFsX19vbl9tN3VCQnUgewogIGNvbG9yOiByZWQ7Cn0KLmlucHV0X0NvbmRpdGlvbmFsX19ub3Rfb25fbTd1QkJ1IHsKICBjb2xvcjogYmx1ZTsKfQ==";
// With foldStatic off, a statically known css prop keeps the runtime path
// instead of folding into a plain className.
const Static = ()=><div {...__yak_mergeCssProp({}, /*YAK Extracted CSS:
.input_Static_m7uBBu {
  color: red;
}
*/ /*#__PURE__*/ css("input_Static_m7uBBu"))}/>;
// A className stays a runtime mergeCssProp call rather than a folded string.
const WithClassName = ()=><div {...__yak_mergeCssProp({
        className: "static"
    }, /*YAK Extracted CSS:
.input_WithClassName_m7uBBu {
  color: blue;
}
*/ /*#__PURE__*/ css("input_WithClassName_m7uBBu"))}/>;
// A conditional css prop keeps the runtime path instead of folding into a
// className expression.
const Conditional = ({ on }: {
    on: boolean;
})=><div {...__yak_mergeCssProp({}, /*YAK Extracted CSS:
.input_Conditional__on_m7uBBu {
  color: red;
}
.input_Conditional__not_on_m7uBBu {
  color: blue;
}
*/ /*#__PURE__*/ css(()=>on ? /*#__PURE__*/ css("input_Conditional__on_m7uBBu") : /*#__PURE__*/ css("input_Conditional__not_on_m7uBBu"), "input_Conditional_m7uBBu"))}/>;
