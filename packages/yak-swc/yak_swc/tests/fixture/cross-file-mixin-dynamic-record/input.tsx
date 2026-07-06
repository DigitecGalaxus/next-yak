import { css } from "next-yak";

// Records of dynamic mixins: every entry compiles to its own V2 template
// with a nameParts comment (variants:primary / variants:danger)
export const variants = {
  primary: css<{ $active: boolean }>`
    color: blue;
    ${({ $active }) =>
      $active &&
      css`
        outline: 1px solid blue;
      `}
  `,
  danger: css<{ $active: boolean }>`
    color: red;
    ${({ $active }) =>
      $active &&
      css`
        outline: 1px solid red;
      `}
  `,
};
