import { styled } from "@yak/solid";
import { spacing, brand } from "./tokens.yak.ts";

const Box = styled.div`
  padding: ${spacing}px;
  color: ${brand};
`;

export default function App() {
  return <Box data-testid="box">Yak file constants</Box>;
}
