import { styled } from "@yak/solid";

const Title = styled.h1`
  color: red;
  font-size: 24px;
`;

export default function App() {
  return <Title data-testid="title">Hello Yak</Title>;
}
