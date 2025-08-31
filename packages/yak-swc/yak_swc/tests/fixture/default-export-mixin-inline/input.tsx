import { css } from "next-yak";
import { otherMixin } from "./otherMixin";

export default css`
  color: red;
  background: yellow;
  font-weight: bold;
  ${otherMixin};
`;
