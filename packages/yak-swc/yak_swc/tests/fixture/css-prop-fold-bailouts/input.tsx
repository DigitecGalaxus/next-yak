// Adversarial shapes for the css prop fold - fold_css_expr only folds css()
// calls and ternaries, so teaching it Expr::Bin must not silently change
// these
import { css } from "next-yak";

const mixin = css`
  color: red;
`;

// bails: a top level `&&` is an Expr::Bin, not a css() call or a ternary
// folding it naively drops the /*YAK Extracted CSS:*/ comment the loader
// parses, which ships the component unstyled
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

// bails: a mixin reference is an Expr::Ident, not a css() call
// this pins a known gap rather than the fold: the css prop does not inline a
// mixin the way a template consumer `${mixin}` does, so `color: red` never
// ships and this renders unstyled
// (teaching the fold Expr::Ident would not change it - a mixin compiles to an
// argument-less css(), which has no base class to fold)
const MixinIdentifier = () => <div css={mixin} />;
