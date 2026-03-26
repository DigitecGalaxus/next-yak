import { styled, keyframes } from "next-yak";

const slide = keyframes`
  from { left: 0px; }
  to { left: 1000px; }
`;

const Box = styled.div`
  position: absolute;
  width: 50px;
  height: 50px;
  background: red;
  animation: ${slide} 100s linear reverse;
  animation-fill-mode: forwards;
`;

export default function App() {
  return <Box data-testid="box" />;
}
