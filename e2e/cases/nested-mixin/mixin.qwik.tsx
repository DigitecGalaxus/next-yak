import { css } from "@yak/qwik";
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
