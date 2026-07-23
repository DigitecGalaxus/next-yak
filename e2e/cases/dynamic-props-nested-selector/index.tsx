import { styled } from "next-yak";
import { Icon } from "./icon.tsx";

// The dynamic prop is turned into a CSS variable set on the styled <div>
// (inline style) but consumed by a *descendant* element — the variable must
// be inherited across the element boundary for these styles to apply.
const Positioned = styled.div<{ $x: number }>`
  position: relative;
  height: 50px;

  button {
    position: absolute;
    left: ${({ $x }) => $x}px;
  }
`;

// Same inheritance dependency expressed through a component selector
const IconBox = styled.div<{ $size: number }>`
  ${Icon} {
    width: ${({ $size }) => $size}px;
  }
`;

export default function App() {
  return (
    <>
      <Positioned $x={32}>
        <button data-testid="button-32">A</button>
      </Positioned>
      <Positioned $x={64}>
        <button data-testid="button-64">B</button>
      </Positioned>
      <IconBox $size={24}>
        <Icon data-testid="icon" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </Icon>
      </IconBox>
    </>
  );
}
