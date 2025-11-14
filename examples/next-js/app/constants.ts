import { css } from "next-yak";

export const tokens = { colors: { orange: "orange" } };

export const mixins = {
  primary: {
    main: css`
      color: lightblue;
    `,
  },
};
