import { css } from "next-yak";
import { otherMixin } from "./otherMixin";

const highlight = css`
  color: red;
  background: yellow;
  font-weight: bold;
  ${otherMixin};
`;

export default highlight;
