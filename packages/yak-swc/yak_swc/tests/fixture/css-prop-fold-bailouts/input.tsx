// Adversarial shapes for the css prop fold - fold_css_expr folds css() calls,
// ternaries and a top level `&&`, so every shape below pins either the fold or
// the bail-out that keeps it on the runtime path
import { css } from "next-yak";

// folds: a top level `&&` becomes `on ? "class" : ""`
// the fold has to keep the /*YAK Extracted CSS:*/ comment the loader parses,
// otherwise the component ships unstyled
const LogicalAnd = ({ on }: { on: boolean }) => (
  <div
    css={
      on &&
      css`
        color: blue;
      `
    }
  />
);

// folds: several condition segments in one template concatenate
const ManySegments = ({ a, b }: { a: boolean; b: boolean }) => (
  <div
    css={css`
      color: black;
      ${() =>
        a &&
        css`
          color: red;
        `}
      ${() =>
        b &&
        css`
          font-weight: bold;
        `}
    `}
  />
);

// folds: a falsy ternary branch applies no styles and yields no class name
const TernaryUndefined = ({ on }: { on: boolean }) => (
  <div
    css={
      on
        ? css`
            color: blue;
          `
        : undefined
    }
  />
);

// bails: the `&&` right hand side carries a runtime css variable, so the css
// call has more than a single static class argument and stays on the runtime
// path
const LogicalAndDynamic = ({ on, color }: { on: boolean; color: string }) => (
  <div
    css={
      on &&
      css`
        color: ${() => color};
      `
    }
  />
);

// mixin references (`css={mixin}`, `css={on && mixin}`) are rejected with a
// compile error - see the css-prop-style-reference fixture
