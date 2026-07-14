/** @jsxImportSource next-yak */
import { css } from "next-yak";
import { useState } from "react";

// Spreads its props (onClick, data-testid, children) onto a css-prop element —
// these must survive the mergeCssProp transform, not get dropped.
function SpreadButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      css={css`
        padding: 8px;
      `}
      {...props}
    />
  );
}

export default function App({ dummyBool = true }) {
  const [count, setCount] = useState(0);
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
      <SpreadButton
        data-testid="spread-button"
        onClick={() => setCount((c) => c + 1)}
      >
        clicks: {count}
      </SpreadButton>
    </>
  );
}
