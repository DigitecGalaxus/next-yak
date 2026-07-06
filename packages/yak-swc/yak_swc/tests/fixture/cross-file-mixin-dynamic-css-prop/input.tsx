import { css } from "next-yak";
// @ts-ignore
import { highlight } from "./highlight";

// A cross-file mixin used inside a css prop: the marker gets a usage-site
// scope prefix and the imported value is passed through __yak_use exactly
// like in a styled component
export const Text = () => (
  <p
    css={css`
      padding: 4px;
      ${highlight};
    `}
  >
    hello
  </p>
);
