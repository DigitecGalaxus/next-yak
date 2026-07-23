// References to styles declared elsewhere are rejected with a compile error:
// a mixin compiles to an argument-less css() carrying no class and no CSS
// (its declarations are inlined at template consumers), so a css prop
// reference would render unstyled without any signal. Only the reference arm
// errors - inline templates in ternary and logical arms keep working, covered
// by css-prop-ternary and css-prop-fold-bailouts.
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
:global(.input_TernaryArm_m7uBBu) {
  color: blue;
}
*/ /*#__PURE__*/ css("input_TernaryArm_m7uBBu")}/>;
