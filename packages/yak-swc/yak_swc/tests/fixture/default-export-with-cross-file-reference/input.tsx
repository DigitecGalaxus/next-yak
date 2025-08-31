import { styled } from "next-yak";
import Text from "./text";

const Box = styled.div`
  padding: 32px;
  background: #333;

  ${Text} {
    color: #00ff00;
    font-weight: bold;
  }
`;

export default Box;
