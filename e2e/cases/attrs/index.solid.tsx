import { styled } from "@yak/solid";

const Button = styled.button.attrs({ type: "button" })`
  color: red;
`;

const Input = styled.input.attrs<{ $size?: string }>((props) => ({
  type: "text",
  $size: props.$size || "1rem",
}))<{ $size?: string }>`
  padding: ${(props) => props.$size};
  border: 2px solid blue;
`;

const PasswordInput = styled(Input).attrs({
  type: "password",
})`
  border-color: green;
`;

// Two attrs layers combine their props without reading the author's
// children: a child component renders once.
let childRenders = 0;
const Child = () => {
  childRenders++;
  return <span data-testid="child-renders">{childRenders}</span>;
};

const FancyButton = styled(Button).attrs({ "data-fancy": "1" })`
  border: 2px solid blue;
`;

export default function App() {
  // per render: the server renders the page once per request
  childRenders = 0;
  return (
    <>
      <Button data-testid="button">Click me</Button>
      <Input data-testid="input" />
      <Input data-testid="input-custom" $size="2rem" />
      <PasswordInput data-testid="password" />
      <FancyButton data-testid="fancy">
        <Child />
      </FancyButton>
    </>
  );
}
