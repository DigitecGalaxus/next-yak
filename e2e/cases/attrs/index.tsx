import { styled } from "next-yak";
import { useState } from "react";

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

// Two attrs layers, one of them a function, combine their props per render
// without reading the author's children: a child component renders once.
let childRenders = 0;
const Child = () => {
  childRenders++;
  return <span data-testid="child-renders">{childRenders}</span>;
};

const FancyButton = styled(Button).attrs(() => ({ "data-fancy": "1" }))`
  border: 2px solid blue;
`;

// boolean and number attrs values
const BakedButton = styled.button.attrs({ type: "button", disabled: true, tabIndex: 0 })`
  color: green;
`;

// a key applied as a dom property keeps its meaning on a fresh mount
const PresetInput = styled.input.attrs({ type: "text", defaultValue: "preset" })`
  border: 1px solid red;
`;

export default function App() {
  // per render: the server renders the page once per request
  childRenders = 0;
  const [mounted, setMounted] = useState(false);
  return (
    <>
      <Button data-testid="button">Click me</Button>
      <Input data-testid="input" />
      <Input data-testid="input-custom" $size="2rem" />
      <PasswordInput data-testid="password" />
      <FancyButton data-testid="fancy">
        <Child />
      </FancyButton>
      <BakedButton data-testid="baked">baked</BakedButton>
      <button data-testid="mount-input" onClick={() => setMounted(true)}>
        mount
      </button>
      {mounted && <PresetInput data-testid="preset-input" />}
    </>
  );
}
