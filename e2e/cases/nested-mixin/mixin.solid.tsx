import { css } from "@yak/solid";
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
