import { styled } from "next-yak";

const Badge = styled.span`
  position: relative;
  padding: 0 16px;

  &::before {
    content: "[";
    color: red;
  }

  &::after {
    content: "]";
    color: blue;
  }
`;

const Underline = styled.div`
  &::after {
    content: "";
    display: block;
    width: 50px;
    height: 2px;
    background-color: green;
  }
`;

export default function App() {
  return (
    <>
      <Badge data-testid="badge">Tag</Badge>
      <Underline data-testid="underline">Underlined</Underline>
    </>
  );
}
