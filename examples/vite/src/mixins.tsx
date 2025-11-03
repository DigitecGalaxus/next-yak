import { css } from "next-yak";
import { otherStyles } from "./otherMixin";
import { myValue } from "./test.yak";

export const baseStyle = css`
  color: red;
  border: ${myValue}px solid black;
  ${otherStyles};
`;
