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
// without reading the author's children. The Solid twin counts the child's
// renders; React strict mode double-invokes renders in dev, so this twin
// renders fixed text.
const Child = () => <span data-testid="child-renders">child</span>;

const FancyButton = styled(Button).attrs<{ "data-fancy"?: string }>(() => ({ "data-fancy": "1" }))`
  border: 2px solid blue;
`;

// boolean and number attrs values
const BakedButton = styled.button.attrs({ type: "button", disabled: true, tabIndex: 0 })`
  color: green;
`;

// a textarea's value renders as its content on the server
const Note = styled.textarea`
  color: blue;
`;

// a key applied as a dom property keeps its meaning on a fresh mount
const PresetInput = styled.input.attrs({ type: "text", defaultValue: "preset" })`
  border: 1px solid red;
`;

export default function App() {
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
      <Note data-testid="note" defaultValue="preset" />
      <button data-testid="mount-input" onClick={() => setMounted(true)}>
        mount
      </button>
      {mounted && <PresetInput data-testid="preset-input" />}
    </>
  );
}
