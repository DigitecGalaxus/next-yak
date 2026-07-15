// Adversarial shapes for the css prop fold - fold_css_expr folds css() calls,
// ternaries and a top level `&&`, so every shape below pins either the fold or
// the bail-out that keeps it on the runtime path
import { css, __yak_mergeCssProp } from "next-yak/internal";
import "data:text/css;base64,LmlucHV0X0xvZ2ljYWxBbmRfbTd1QkJ1IHsKICBjb2xvcjogYmx1ZTsKfS5pbnB1dF9NYW55U2VnbWVudHNfbTd1QkJ1IHsKICBjb2xvcjogYmxhY2s7Cn0KLmlucHV0X01hbnlTZWdtZW50c19fYV9tN3VCQnUgewogIGNvbG9yOiByZWQ7Cn0KLmlucHV0X01hbnlTZWdtZW50c19fYl9tN3VCQnUgewogIGZvbnQtd2VpZ2h0OiBib2xkOwp9LmlucHV0X1Rlcm5hcnlVbmRlZmluZWRfbTd1QkJ1IHsKICBjb2xvcjogYmx1ZTsKfS5pbnB1dF9Mb2dpY2FsQW5kRHluYW1pY19tN3VCQnUgewogIGNvbG9yOiB2YXIoLS1pbnB1dF9Mb2dpY2FsQW5kRHluYW1pY19fY29sb3JfbTd1QkJ1KTsKfQ==";
// folds: a top level `&&` becomes `on ? "class" : ""`
// the fold has to keep the /*YAK Extracted CSS:*/ comment the loader parses,
// otherwise the component ships unstyled
const LogicalAnd = ({ on }: {
    on: boolean;
})=><div className={/*YAK Extracted CSS:
.input_LogicalAnd_m7uBBu {
  color: blue;
}
*/ /*#__PURE__*/ on ? "input_LogicalAnd_m7uBBu" : ""}/>;
// folds: several condition segments in one template concatenate
const ManySegments = ({ a, b }: {
    a: boolean;
    b: boolean;
})=><div className={/*YAK Extracted CSS:
.input_ManySegments_m7uBBu {
  color: black;
}
.input_ManySegments__a_m7uBBu {
  color: red;
}
.input_ManySegments__b_m7uBBu {
  font-weight: bold;
}
*/ /*#__PURE__*/ "input_ManySegments_m7uBBu" + (a ? " input_ManySegments__a_m7uBBu" : "") + (b ? " input_ManySegments__b_m7uBBu" : "")}/>;
// folds: a falsy ternary branch applies no styles and yields no class name
const TernaryUndefined = ({ on }: {
    on: boolean;
})=><div className={on ? /*YAK Extracted CSS:
.input_TernaryUndefined_m7uBBu {
  color: blue;
}
*/ /*#__PURE__*/ "input_TernaryUndefined_m7uBBu" : ""}/>;
// bails: the `&&` right hand side carries a runtime css variable, so the css
// call has more than a single static class argument and stays on the runtime
// path
const LogicalAndDynamic = ({ on, color }: {
    on: boolean;
    color: string;
})=><div {...__yak_mergeCssProp({}, on && /*YAK Extracted CSS:
.input_LogicalAndDynamic_m7uBBu {
  color: var(--input_LogicalAndDynamic__color_m7uBBu);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--input_LogicalAndDynamic__color_m7uBBu": ()=>color
        }
    }, "input_LogicalAndDynamic_m7uBBu"))}/>; // mixin references (`css={mixin}`, `css={on && mixin}`) are rejected with a
 // compile error - see the css-prop-style-reference fixture
