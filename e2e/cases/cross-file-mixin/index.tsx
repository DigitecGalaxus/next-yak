import { styled } from "next-yak";
import { highlightMixin } from "./mixin.tsx";

const ListItem = styled.li`
  margin-bottom: 10px;
  color: red;
  ${highlightMixin};
`;

export default function App() {
  return (
    <ul>
      <ListItem data-testid="item">Highlighted item</ListItem>
    </ul>
  );
}
