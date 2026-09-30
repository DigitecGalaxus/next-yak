import { css } from "@yak/react";
import { otherMixin } from "./otherMixin";

export default css`
  color: red;
  background: yellow;
  font-weight: bold;
  ${otherMixin};
`;
