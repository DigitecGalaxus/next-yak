import { css } from "next-yak";
import { buttonMixin } from "../mixin.tsx";
import { typography } from "./typography.tsx";

export const primaryButtonMixin = css`
  ${buttonMixin};
  color: green;
  ${typography.h1}
`;
