import { styled } from "next-yak";

const Input = styled.input`
  padding: 8px;
`;

const Wrapper = styled.div`
  background-color: white;
  padding: 16px;
  transition: background-color 0.01s;

  &:has(${Input}:focus) {
    background-color: lightblue;
  }
`;

export default function App() {
  return (
    <Wrapper data-testid="wrapper">
      <Input data-testid="input" />
    </Wrapper>
  );
}
