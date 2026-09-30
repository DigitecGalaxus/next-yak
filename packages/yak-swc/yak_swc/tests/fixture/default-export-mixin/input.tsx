import { css } from "@yak/react";
import { otherMixin } from "./otherMixin";

const highlight = css`
  color: red;
  background: yellow;
  font-weight: bold;
  ${otherMixin};
`;

export default highlight;
