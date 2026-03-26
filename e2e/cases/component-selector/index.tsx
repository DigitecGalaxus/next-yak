import { styled } from "next-yak";
import { Icon } from "./icon.tsx";

const Button = styled.button`
  display: flex;
  align-items: center;

  ${Icon} {
    margin-right: 10px;
  }
`;

export default function App() {
  return (
    <Button data-testid="button">
      <Icon data-testid="icon" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
      </Icon>
      Click me
    </Button>
  );
}
