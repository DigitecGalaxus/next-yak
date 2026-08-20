import { css } from "@yak/solid";
import { createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";

// Spreads its props (onClick, data-testid, children) onto a css-prop element —
// these must survive the mergeCssProp transform, not get dropped.
function SpreadButton(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
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
  const [count, setCount] = createSignal(0);
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
      <div
        data-testid="entity-classname"
        class="Food &amp; Drink"
        css={css`
          color: blue;
        `}
      >
        Entity className
      </div>
      <div
        data-testid="backslash-classname"
        class="before:content-['\q']"
        css={css`
          color: blue;
        `}
      >
        Backslash className
      </div>
      <SpreadButton data-testid="spread-button" onClick={() => setCount((c) => c + 1)}>
        clicks: {count()}
      </SpreadButton>
    </>
  );
}
