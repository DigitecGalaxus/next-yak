import { styled } from "next-yak";
import { outlined, Heading } from "./shared.tsx";

const Box = styled.div`
  ${outlined};

  ${Heading} {
    font-size: 20px;
  }
`;

export default function App() {
  return (
    <Box data-testid="box">
      <Heading data-testid="heading">Title</Heading>
    </Box>
  );
}
