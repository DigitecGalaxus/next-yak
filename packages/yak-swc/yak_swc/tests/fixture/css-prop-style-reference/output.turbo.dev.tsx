// References to styles declared elsewhere are rejected with a compile error:
// a mixin compiles to an argument-less css() carrying no class and no CSS
// (its declarations are inlined at template consumers), so a css prop
// reference would render unstyled without any signal.
// Inline templates in ternary and logical arms keep working - only the
// reference arms error.
import { css, __yak_mergeCssProp } from "next-yak/internal";
import { ellipsis } from "./typography";
import * as tokens from "./tokens";
import "data:text/css;base64,LmlucHV0X1Rlcm5hcnlBcm1fbTd1QkJ1IHsKICBjb2xvcjogYmx1ZTsKfS5pbnB1dF9UZXJuYXJ5SW5saW5lX203dUJCdSB7CiAgbGluZS1oZWlnaHQ6IDE7Cn0uaW5wdXRfVGVybmFyeUlubGluZV9tN3VCQnUtMDEgewogIGxpbmUtaGVpZ2h0OiAxLjU7Cn0uaW5wdXRfVGVybmFyeVVuZGVmaW5lZF9tN3VCQnUgewogIGNvbG9yOiBncmVlbjsKfQ==";
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
.input_TernaryArm_m7uBBu {
  color: blue;
}
*/ /*#__PURE__*/ css("input_TernaryArm_m7uBBu")}/>;
// keeps working: inline templates in both ternary arms
const TernaryInline = ({ compact }: {
    compact: boolean;
})=><div className={compact ? /*YAK Extracted CSS:
.input_TernaryInline_m7uBBu {
  line-height: 1;
}
*/ /*#__PURE__*/ "input_TernaryInline_m7uBBu" : /*YAK Extracted CSS:
.input_TernaryInline_m7uBBu-01 {
  line-height: 1.5;
}
*/ /*#__PURE__*/ "input_TernaryInline_m7uBBu-01"}/>;
// keeps working: `undefined` is a valid falsy arm, not a reference
const TernaryUndefined = ({ on }: {
    on: boolean;
})=><div className={on ? /*YAK Extracted CSS:
.input_TernaryUndefined_m7uBBu {
  color: green;
}
*/ /*#__PURE__*/ "input_TernaryUndefined_m7uBBu" : ""}/>;
