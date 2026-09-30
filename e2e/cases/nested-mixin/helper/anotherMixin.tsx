import { css } from "@yak/react";
import { buttonMixin } from "../mixin.tsx";
import { typography } from "./typography.tsx";

export const primaryButtonMixin = css`
  ${buttonMixin};
  color: green;
  ${typography.h1}
`;
