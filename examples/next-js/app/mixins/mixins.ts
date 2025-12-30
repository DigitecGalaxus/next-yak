import { css } from "next-yak";

const sizes = [16, 14, 12, 10, 8];

export const typography = {
  typographies: ["h1", "h2"],
  h1: css`
    font-family: "Roboto", sans-serif;
    font-size: ${sizes[0]}px;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: 0.00938em;
  `,
  h2: css`
    font-family: "Roboto", sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: 0.00938em;
  `,
};
