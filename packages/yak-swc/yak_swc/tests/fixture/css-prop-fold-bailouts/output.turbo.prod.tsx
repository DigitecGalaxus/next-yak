// Adversarial shapes for the css prop fold - fold_css_expr folds css() calls,
// ternaries and a top level `&&`, so every shape below pins either the fold or
// the bail-out that keeps it on the runtime path
import { css, __yak_mergeCssProp } from "next-yak/internal";
import "data:text/css;base64,LnltN3VCQnUxIHsKICBjb2xvcjogYmx1ZTsKfS55bTd1QkJ1MiB7CiAgY29sb3I6IGJsYWNrOwp9Ci55bTd1QkJ1MyB7CiAgY29sb3I6IHJlZDsKfQoueW03dUJCdTQgewogIGZvbnQtd2VpZ2h0OiBib2xkOwp9LnltN3VCQnU1IHsKICBjb2xvcjogYmx1ZTsKfS55bTd1QkJ1NiB7CiAgY29sb3I6IHZhcigtLXltN3VCQnU3KTsKfQ==";
const mixin = /*#__PURE__*/ css();
// folds: a top level `&&` becomes `on ? "class" : ""`
// the fold has to keep the /*YAK Extracted CSS:*/ comment the loader parses,
// otherwise the component ships unstyled
const LogicalAnd = ({ on }: {
    on: boolean;
})=><div className={/*YAK Extracted CSS:
.ym7uBBu1 {
  color: blue;
}
*/ /*#__PURE__*/ on ? "ym7uBBu1" : ""}/>;
// folds: several condition segments in one template concatenate
const ManySegments = ({ a, b }: {
    a: boolean;
    b: boolean;
})=><div className={/*YAK Extracted CSS:
.ym7uBBu2 {
  color: black;
}
.ym7uBBu3 {
  color: red;
}
.ym7uBBu4 {
  font-weight: bold;
}
*/ /*#__PURE__*/ "ym7uBBu2" + (a ? " ym7uBBu3" : "") + (b ? " ym7uBBu4" : "")}/>;
// folds: a falsy ternary branch applies no styles and yields no class name
const TernaryUndefined = ({ on }: {
    on: boolean;
})=><div className={on ? /*YAK Extracted CSS:
.ym7uBBu5 {
  color: blue;
}
*/ /*#__PURE__*/ "ym7uBBu5" : ""}/>;
// bails: the `&&` right hand side carries a runtime css variable, so the css
// call has more than a single static class argument and stays on the runtime
// path
const LogicalAndDynamic = ({ on, color }: {
    on: boolean;
    color: string;
})=><div {...__yak_mergeCssProp({}, on && /*YAK Extracted CSS:
.ym7uBBu6 {
  color: var(--ym7uBBu7);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--ym7uBBu7": ()=>color
        }
    }, "ym7uBBu6"))}/>;
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
