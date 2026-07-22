import { css } from "next-yak";

const on = Math.random() > 0.5;
const big = Math.random() > 0.5;
const props = {} as any;

// folds: a nested ternary becomes a nested className expression
const Nested = () => (
  <div
    css={
      on
        ? big
          ? css`
              color: red;
            `
          : css`
              color: blue;
            `
        : css`
            color: green;
          `
    }
  />
);

// folds: a `&&` chain with an impure condition inlines the condition into the
// className, evaluating it once
const AndChain = () => (
  <div
    css={css`
      color: black;
      ${() =>
        Math.random() > 0.5 &&
        css`
          font-weight: bold;
        `}
      ${() =>
        Math.random() > 0.5 &&
        css`
          text-decoration: underline;
        `}
    `}
  />
);

// folds: a css prop next to a `style` attribute keeps the style and folds the
// class in (style is the only mergeable attribute the fold allows)
const WithStyle = () => (
  <div
    style={{ padding: 4 }}
    css={css`
      color: teal;
    `}
  />
);

// bails: a className is not a style, so the fold hands off to the runtime merge
const WithClassName = () => (
  <div
    css={css`
      color: purple;
    `}
    className="user"
  />
);

// bails: className and style together keep the runtime merge
const WithBoth = () => (
  <div
    css={css`
      font-size: 16px;
    `}
    className="main"
    style={{ fontWeight: "bold" }}
  />
);

// bails: a spread element may carry a className, so the fold keeps the runtime
// merge
const WithSpread = () => (
  <div
    css={css`
      color: olive;
    `}
    {...props}
  />
);

// bails: a runtime css variable is a mixed static/dynamic segment the fold
// cannot flatten, so the whole prop stays on the runtime path
const MixedDynamic = ({ color }: { color: string }) => (
  <div
    css={css`
      color: ${() => color};
    `}
  />
);
