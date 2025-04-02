import { css } from "next-yak";

<div
  css={css`
    color: red;
  `}
>
  <p
    css={css`
      color: blue;
    `}
  >
    <span
      css={css`
        color: green;
      }`}
    >
      hello
    </span>
    world
  </p>
</div>;
