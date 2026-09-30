import { css } from "@yak/react";

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
