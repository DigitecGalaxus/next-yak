// Adversarial shapes for the css prop fold - fold_css_expr only folds css()
// calls and ternaries, so teaching it Expr::Bin must not silently change
// these
import { css, __yak_mergeCssProp } from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const mixin = /*#__PURE__*/ css();
// bails: a top level `&&` is an Expr::Bin, not a css() call or a ternary
// folding it naively drops the /*YAK Extracted CSS:*/ comment the loader
// parses, which ships the component unstyled
const LogicalAnd = ({ on }: {
    on: boolean;
})=><div {...__yak_mergeCssProp({}, on && /*YAK Extracted CSS:
:global(.ym7uBBu1) {
  color: blue;
}
*/ /*#__PURE__*/ css("ym7uBBu1"))}/>;
// folds: several condition segments in one template concatenate
const ManySegments = ({ a, b }: {
    a: boolean;
    b: boolean;
})=><div className={/*YAK Extracted CSS:
:global(.ym7uBBu2) {
  color: black;
}
:global(.ym7uBBu3) {
  color: red;
}
:global(.ym7uBBu4) {
  font-weight: bold;
}
*/ /*#__PURE__*/ "ym7uBBu2" + (a ? " ym7uBBu3" : "") + (b ? " ym7uBBu4" : "")}/>;
// bails: a mixin reference is an Expr::Ident, not a css() call
// this pins a known gap rather than the fold: the css prop does not inline a
// mixin the way a template consumer `${mixin}` does, so `color: red` never
// ships and this renders unstyled
// (teaching the fold Expr::Ident would not change it - a mixin compiles to an
// argument-less css(), which has no base class to fold)
const MixinIdentifier = ()=><div {...__yak_mergeCssProp({}, mixin)}/>;
