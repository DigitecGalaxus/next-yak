import { styled } from "next-yak";

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

export default function App() {
  return (
    <>
      <Button data-testid="button">Click me</Button>
      <Input data-testid="input" />
      <Input data-testid="input-custom" $size="2rem" />
      <PasswordInput data-testid="password" />
    </>
  );
}
