import { css, __yak_mergeCssProp } from "next-yak/internal";
import "data:text/css;base64,LnltN3VCQnUgewogIGNvbG9yOiByZWQ7Cn0ueW03dUJCdTEgewogIGNvbG9yOiBibHVlOwp9LnltN3VCQnUzIHsKICBjb2xvcjogcmVkOwp9Ci55bTd1QkJ1NCB7CiAgY29sb3I6IGJsdWU7Cn0=";
// With foldStatic off, a statically known css prop keeps the runtime path
// instead of folding into a plain className.
const Static = ()=><div {...__yak_mergeCssProp({}, /*YAK Extracted CSS:
.ym7uBBu {
  color: red;
}
*/ /*#__PURE__*/ css("ym7uBBu"))}/>;
// A className stays a runtime mergeCssProp call rather than a folded string.
const WithClassName = ()=><div {...__yak_mergeCssProp({
        className: "static"
    }, /*YAK Extracted CSS:
.ym7uBBu1 {
  color: blue;
}
*/ /*#__PURE__*/ css("ym7uBBu1"))}/>;
// A conditional css prop keeps the runtime path instead of folding into a
// className expression.
const Conditional = ({ on }: {
    on: boolean;
})=><div {...__yak_mergeCssProp({}, /*YAK Extracted CSS:
.ym7uBBu3 {
  color: red;
}
.ym7uBBu4 {
  color: blue;
}
*/ /*#__PURE__*/ css(()=>on ? /*#__PURE__*/ css("ym7uBBu3") : /*#__PURE__*/ css("ym7uBBu4"), "ym7uBBu2"))}/>;
