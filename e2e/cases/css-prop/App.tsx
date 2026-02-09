/** @jsxImportSource next-yak */
import { css } from "next-yak";

export default function App({ dummyBool = true }) {
  return (
    <>
      <div
        data-testid="basic"
        css={css`
          padding: 16px;
        `}
      >
        Basic css prop
      </div>
      <div
        data-testid="conditional"
        css={css`
          color: red;
          ${() =>
            dummyBool &&
            css`
              color: green;
            `}
        `}
      >
        Conditional css prop
      </div>
      <div
        data-testid="parent"
        css={css`
          color: violet;
        `}
      >
        <span
          data-testid="child"
          css={css`
            color: green;
          `}
        >
          Nested child
        </span>
      </div>
    </>
  );
}
