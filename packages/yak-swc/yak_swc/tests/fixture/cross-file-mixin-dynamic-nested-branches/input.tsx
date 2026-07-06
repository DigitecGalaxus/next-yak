import { css } from "next-yak";

// Exported dynamic mixin with a nested branch (branch inside branch) and a
// nested selector context inside the outer branch. Each branch gets its own
// @yak-branch block in the payload; the runtime template chains the
// conditions so the inner branch only toggles when the outer one matched.
export const fancy = css<{ $a: boolean; $b: boolean }>`
  color: black;
  ${({ $a }) =>
    $a &&
    css`
      color: red;
      &:hover {
        color: darkred;
      }
      ${({ $b }) =>
        $b &&
        css`
          color: blue;
        `}
    `}
`;
