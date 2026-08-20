import { styled } from "@yak/solid";
import { colors } from "./constants.ts";

const Button = styled.button`
  color: ${colors.primary};
  background-color: ${colors.secondary};
`;

export default function App() {
  return <Button data-testid="button">Namespace Import</Button>;
}
