// References to styles declared elsewhere are rejected with a compile error:
// a mixin compiles to an argument-less css() carrying no class and no CSS
// (its declarations are inlined at template consumers), so a css prop
// reference would render unstyled without any signal.
// Inline templates in ternary and logical arms keep working - only the
// reference arms error.
import { css, __yak_mergeCssProp } from "next-yak/internal";
import { ellipsis } from "./typography";
import * as tokens from "./tokens";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const mixin = /*#__PURE__*/ css();
// errors: a same-file mixin reference
const Direct = ()=><div css={mixin}/>;
// errors: an imported mixin reference compiles identically
const Imported = ()=><div css={ellipsis}/>;
// errors: a member reference
const Member = ()=><div css={tokens.padding}/>;
// errors: the `&&` right hand side is a reference
const LogicalAnd = ({ on }: {
    on: boolean;
})=><div css={on && mixin}/>;
// errors: one ternary arm is a reference - the inline arm alone can not save it
const TernaryArm = ({ compact }: {
    compact: boolean;
})=><div css={compact ? mixin : /*YAK Extracted CSS:
:global(.ym7uBBu1) {
  color: blue;
}
*/ /*#__PURE__*/ css("ym7uBBu1")}/>;
// keeps working: inline templates in both ternary arms
const TernaryInline = ({ compact }: {
    compact: boolean;
})=><div {...__yak_mergeCssProp({}, compact ? /*YAK Extracted CSS:
:global(.ym7uBBu2) {
  line-height: 1;
}
*/ /*#__PURE__*/ css("ym7uBBu2") : /*YAK Extracted CSS:
:global(.ym7uBBu3) {
  line-height: 1.5;
}
*/ /*#__PURE__*/ css("ym7uBBu3"))}/>;
// keeps working: `undefined` is a valid falsy arm, not a reference
const TernaryUndefined = ({ on }: {
    on: boolean;
})=><div {...__yak_mergeCssProp({}, on ? /*YAK Extracted CSS:
:global(.ym7uBBu4) {
  color: green;
}
*/ /*#__PURE__*/ css("ym7uBBu4") : undefined)}/>;
