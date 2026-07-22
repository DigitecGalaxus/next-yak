import { css } from "next-yak";

// With foldStatic off, a statically known css prop keeps the runtime path
// instead of folding into a plain className.
const Static = () => (
  <div
    css={css`
      color: red;
    `}
  />
);

// A className stays a runtime mergeCssProp call rather than a folded string.
const WithClassName = () => (
  <div
    css={css`
      color: blue;
    `}
    className="static"
  />
);

// A conditional css prop keeps the runtime path instead of folding into a
// className expression.
const Conditional = ({ on }: { on: boolean }) => (
  <div
    css={css`
      ${() =>
        on
          ? css`
              color: red;
            `
          : css`
              color: blue;
            `}
    `}
  />
);
