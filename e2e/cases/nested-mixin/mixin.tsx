import { css } from "@yak/react";
import { Icon } from "./icon.tsx";

const buttonTextMixin = css`
  color: black;
`;

export const buttonMixin = css`
  ${buttonTextMixin};
  ${Icon} {
    ${buttonTextMixin};
  }
`;
