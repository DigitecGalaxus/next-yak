import { styled } from "@yak/qwik";

const Box = styled.div`
  color: red;
`;

export default function App() {
  return <Box data-testid="box">HMR Test</Box>;
}
