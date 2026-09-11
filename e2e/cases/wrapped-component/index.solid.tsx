import { css, styled } from "@yak/solid";
import type { JSX } from "@solidjs/web";

// A styled component target receives the generated class, the author's props
// and even a prop named `component`, but never the $ props that only drive
// the styles.
function Card(props: {
  class?: string;
  component?: string;
  title?: string;
  children?: JSX.Element;
}) {
  const keys = Object.keys(props).sort().join(",");
  return (
    <div data-testid="card" data-keys={keys} data-component={props.component} class={props.class}>
      {props.children}
    </div>
  );
}

const StyledCard = styled(Card)<{ $accent?: boolean }>`
  padding: 12px;
  color: rgb(0, 0, 255);
  ${({ $accent }) =>
    $accent &&
    css`
      color: rgb(255, 0, 0);
    `}
`;

export default function App() {
  return (
    <StyledCard $accent component="section" title="hello">
      wrapped
    </StyledCard>
  );
}
