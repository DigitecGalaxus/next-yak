import { css } from "next-yak";

// The simplest dynamic mixin: one static part, one conditional branch.
// Exporting it must compile it to a class-name-parameterized template
// (a V2 payload comment + __yak_mixin factory) instead of erroring.
export const highlight = css<{ $active: boolean }>`
  color: black;
  ${({ $active }) =>
    $active &&
    css`
      color: red;
    `}
`;
