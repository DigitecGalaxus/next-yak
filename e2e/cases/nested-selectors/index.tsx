import { styled } from "next-yak";

const Container = styled.div`
  color: black;

  & > span {
    font-weight: bold;
  }

  &:hover {
    color: blue;
  }
`;

export default function App() {
  return (
    <Container data-testid="container">
      <span data-testid="inner">Bold child</span>
    </Container>
  );
}
