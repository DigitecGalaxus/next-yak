import { css } from "@yak/react";

export const typography = {
  h1: css`
    font-size: 2rem;
    letter-spacing: 0.1rem;
    line-height: 2rem;
    font-weight: ${({ $active }) => $active ? 'bold' : 'normal'};
  `,
  h2: css`
    font-size: 1.5rem;
    letter-spacing: 0.08rem;
    line-height: 1.5rem;
    font-weight: bold;
  `,
  h3: css`
    font-size: 1.17rem;
    letter-spacing: 0.05rem;
    line-height: 1.17rem;
    font-weight: bold;
  `,
  h4: css`
    font-size: 1rem;
    letter-spacing: 0.03rem;
    line-height: 1rem;
    font-weight: bold;
  `,
  h5: css`
    font-size: 0.83rem;
    letter-spacing: 0.02rem;
    line-height: 0.83rem;
    font-weight: bold;
  `,
  h6: css`
    font-size: 0.67rem;
    letter-spacing: 0.01rem;
    line-height: 0.67rem;
    font-weight: bold;
  `,
};