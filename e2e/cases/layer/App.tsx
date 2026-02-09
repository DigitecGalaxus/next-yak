import { styled } from "next-yak";

const Box = styled.div`
  @layer base {
    color: red;
  }
  color: blue;
`;

export default function App() {
  return <Box data-testid="box">Layered</Box>;
}
