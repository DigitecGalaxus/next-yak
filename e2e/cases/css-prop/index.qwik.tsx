import { component$, useSignal, type PropsOf } from "@qwik.dev/core";
import { css } from "@yak/qwik";

// Spreads its props (onClick$, data-testid, children) onto a css-prop element —
// these must survive the mergeCssProp transform, not get dropped.
function SpreadButton(props: PropsOf<"button">) {
  return (
    <button
      css={css`
        padding: 8px;
      `}
      {...props}
    />
  );
}

export default component$(({ dummyBool = true }: { dummyBool?: boolean }) => {
  const count = useSignal(0);
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
      <SpreadButton data-testid="spread-button" onClick$={() => count.value++}>
        clicks: {count.value}
      </SpreadButton>
      {/* a class from a spread source merges with the css prop's class */}
      <div
        data-testid="spread-class"
        {...{ class: "from-spread" }}
        css={css`
          color: blue;
        `}
      >
        spread class
      </div>
      {/* the later source wins: the spread's class replaces the attribute before it */}
      <div
        data-testid="later-wins"
        class="early"
        {...{ class: "late" }}
        css={css`
          color: blue;
        `}
      >
        later wins
      </div>
      {/* a css prop interpolation reading a signal stays live */}
      <div
        data-testid="live"
        css={css`
          color: blue;
          ${() =>
            count.value > 0 &&
            css`
              color: red;
            `}
        `}
      >
        live
      </div>
    </>
  );
});
