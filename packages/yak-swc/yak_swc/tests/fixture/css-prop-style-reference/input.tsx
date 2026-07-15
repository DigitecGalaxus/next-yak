// References to styles declared elsewhere are rejected with a compile error:
// a mixin compiles to an argument-less css() carrying no class and no CSS
// (its declarations are inlined at template consumers), so a css prop
// reference would render unstyled without any signal.
// Inline templates in ternary and logical arms keep working - only the
// reference arms error.
import { css } from "next-yak";
import { ellipsis } from "./typography";
import * as tokens from "./tokens";

const mixin = css`
  color: red;
`;

// errors: a same-file mixin reference
const Direct = () => <div css={mixin} />;

// errors: an imported mixin reference compiles identically
const Imported = () => <div css={ellipsis} />;

// errors: a member reference
const Member = () => <div css={tokens.padding} />;

// errors: the `&&` right hand side is a reference
const LogicalAnd = ({ on }: { on: boolean }) => <div css={on && mixin} />;

// errors: one ternary arm is a reference - the inline arm alone can not save it
const TernaryArm = ({ compact }: { compact: boolean }) => (
  <div
    css={
      compact
        ? mixin
        : css`
            color: blue;
          `
    }
  />
);

// keeps working: inline templates in both ternary arms
const TernaryInline = ({ compact }: { compact: boolean }) => (
  <div
    css={
      compact
        ? css`
            line-height: 1;
          `
        : css`
            line-height: 1.5;
          `
    }
  />
);

// keeps working: `undefined` is a valid falsy arm, not a reference
const TernaryUndefined = ({ on }: { on: boolean }) => (
  <div
    css={
      on
        ? css`
            color: green;
          `
        : undefined
    }
  />
);
