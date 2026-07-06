import { css } from "next-yak";

/**
 * Cross-file dynamic mixin (spike): a mixin with a conditional branch
 * that is exported and used from another file (App.tsx / DynamicMixinDemo.tsx)
 */
export const highlight = css<{ $active: boolean }>`
  color: black;
  font-style: italic;
  ${({ $active }) =>
    $active &&
    css`
      color: red;
      text-decoration: underline;
    `}
`;
