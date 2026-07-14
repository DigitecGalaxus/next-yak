// Adversarial shapes for the css prop fold - fold_css_expr folds css() calls,
// ternaries and a top level `&&`, so every shape below pins either the fold or
// the bail-out that keeps it on the runtime path
import { css, __yak_mergeCssProp } from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const mixin = /*#__PURE__*/ css();
// folds: a top level `&&` becomes `on ? "class" : ""`
// the fold has to keep the /*YAK Extracted CSS:*/ comment the loader parses,
// otherwise the component ships unstyled
const LogicalAnd = ({ on }: {
    on: boolean;
})=><div className={/*YAK Extracted CSS:
:global(.input_LogicalAnd_m7uBBu) {
  color: blue;
}
*/ /*#__PURE__*/ on ? "input_LogicalAnd_m7uBBu" : ""}/>;
// folds: several condition segments in one template concatenate
const ManySegments = ({ a, b }: {
    a: boolean;
    b: boolean;
})=><div className={/*YAK Extracted CSS:
:global(.input_ManySegments_m7uBBu) {
  color: black;
}
:global(.input_ManySegments__a_m7uBBu) {
  color: red;
}
:global(.input_ManySegments__b_m7uBBu) {
  font-weight: bold;
}
*/ /*#__PURE__*/ "input_ManySegments_m7uBBu" + (a ? " input_ManySegments__a_m7uBBu" : "") + (b ? " input_ManySegments__b_m7uBBu" : "")}/>;
// folds: a falsy ternary branch applies no styles and yields no class name
const TernaryUndefined = ({ on }: {
    on: boolean;
})=><div className={on ? /*YAK Extracted CSS:
:global(.input_TernaryUndefined_m7uBBu) {
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
:global(.input_LogicalAndDynamic_m7uBBu) {
  color: var(--input_LogicalAndDynamic__color_m7uBBu);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--input_LogicalAndDynamic__color_m7uBBu": ()=>color
        }
    }, "input_LogicalAndDynamic_m7uBBu"))}/>;
// bails: the `&&` right hand side is an Expr::Ident, not a css() call
const LogicalAndMixin = ({ on }: {
    on: boolean;
})=><div {...__yak_mergeCssProp({}, on && mixin)}/>;
// bails: a mixin reference is an Expr::Ident, not a css() call
// this pins a known gap rather than the fold: the css prop does not inline a
// mixin the way a template consumer `${mixin}` does, so `color: red` never
// ships and this renders unstyled
// (teaching the fold Expr::Ident would not change it - a mixin compiles to an
// argument-less css(), which has no base class to fold)
const MixinIdentifier = ()=><div {...__yak_mergeCssProp({}, mixin)}/>;
