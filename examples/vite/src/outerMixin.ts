import { css } from "next-yak";
import { highlight } from "./dynamicMixin";

/**
 * A dynamic mixin that itself uses a dynamic mixin from another file
 * (slot scoping / recursion)
 */
export const card = css<{ $active: boolean }>`
  border: 2px dashed #999;
  ${highlight};
  ${({ $active }) =>
    $active &&
    css`
      border-color: red;
    `}
`;
