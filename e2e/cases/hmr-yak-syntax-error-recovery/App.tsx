import { styled } from "next-yak";
import { spacing, brand } from "./tokens.yak.ts";

const Box = styled.div`
  padding: ${spacing}px;
  color: ${brand};
`;

export default function App() {
  return <Box data-testid="box">Syntax error recovery</Box>;
}
