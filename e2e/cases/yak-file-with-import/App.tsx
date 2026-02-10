import { styled } from "next-yak";
import { spacing, brandColor } from "./tokens.yak.ts";

const Box = styled.div`
  padding: ${spacing}px;
  color: ${brandColor};
`;

export default function App() {
  return <Box data-testid="box">Yak file with import</Box>;
}
