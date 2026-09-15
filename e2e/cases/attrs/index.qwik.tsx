import { component$, useSignal } from "@qwik.dev/core";
import { styled } from "@yak/qwik";

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
// the count lives in an object: qwik's optimizer turns a module-level `let`
// that a $ scope reaches into an import, which cannot be assigned
const renders = { child: 0 };
const Child = () => {
  renders.child++;
  return <span data-testid="child-renders">{renders.child}</span>;
};

const FancyButton = styled(Button).attrs(() => ({ "data-fancy": "1" }))`
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

// a value attribute keeps its meaning on a fresh mount
const PresetInput = styled.input.attrs({ type: "text", value: "preset" })`
  border: 1px solid red;
`;

const Page = component$(() => {
  const mounted = useSignal(false);
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
      <Note data-testid="note" value="preset" />
      <button data-testid="mount-input" onClick$={() => (mounted.value = true)}>
        mount
      </button>
      {mounted.value && <PresetInput data-testid="preset-input" />}
    </>
  );
});

export default function App() {
  // per render: the server renders the page once per request
  renders.child = 0;
  return <Page />;
}
