// Adversarial shapes for the css prop fold - fold_css_expr folds css() calls,
// ternaries and a top level `&&`, so every shape below pins either the fold or
// the bail-out that keeps it on the runtime path
import { css, __yak_mergeCssProp } from "next-yak/internal";
import "data:text/css;base64,LnltN3VCQnUgewogIGNvbG9yOiBibHVlOwp9LnltN3VCQnUxIHsKICBjb2xvcjogYmxhY2s7Cn0KLnltN3VCQnUyIHsKICBjb2xvcjogcmVkOwp9Ci55bTd1QkJ1MyB7CiAgZm9udC13ZWlnaHQ6IGJvbGQ7Cn0ueW03dUJCdTQgewogIGNvbG9yOiBibHVlOwp9LnltN3VCQnU1IHsKICBjb2xvcjogdmFyKC0teW03dUJCdTYpOwp9";
// folds: a top level `&&` becomes `on ? "class" : ""`
// the fold has to keep the /*YAK Extracted CSS:*/ comment the loader parses,
// otherwise the component ships unstyled
const LogicalAnd = ({ on }: {
    on: boolean;
})=><div className={/*YAK Extracted CSS:
.ym7uBBu {
  color: blue;
}
*/ /*#__PURE__*/ on ? "ym7uBBu" : ""}/>;
// folds: several condition segments in one template concatenate
const ManySegments = ({ a, b }: {
    a: boolean;
    b: boolean;
})=><div className={/*YAK Extracted CSS:
.ym7uBBu1 {
  color: black;
}
.ym7uBBu2 {
  color: red;
}
.ym7uBBu3 {
  font-weight: bold;
}
*/ /*#__PURE__*/ "ym7uBBu1" + (a ? " ym7uBBu2" : "") + (b ? " ym7uBBu3" : "")}/>;
// folds: a falsy ternary branch applies no styles and yields no class name
const TernaryUndefined = ({ on }: {
    on: boolean;
})=><div className={on ? /*YAK Extracted CSS:
.ym7uBBu4 {
  color: blue;
}
*/ /*#__PURE__*/ "ym7uBBu4" : ""}/>;
// bails: the `&&` right hand side carries a runtime css variable, so the css
// call has more than a single static class argument and stays on the runtime
// path
const LogicalAndDynamic = ({ on, color }: {
    on: boolean;
    color: string;
})=><div {...__yak_mergeCssProp({}, on && /*YAK Extracted CSS:
.ym7uBBu5 {
  color: var(--ym7uBBu6);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--ym7uBBu6": ()=>color
        }
    }, "ym7uBBu5"))}/>; // mixin references (`css={mixin}`, `css={on && mixin}`) are rejected with a
 // compile error - see the css-prop-style-reference fixture
