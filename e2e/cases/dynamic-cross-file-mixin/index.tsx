import { useState } from "react";
import { styled } from "next-yak";
import { highlight } from "./mixin.tsx";

const Item = styled.p<{ $active: boolean; $pad: number }>`
  color: black;
  ${highlight};
  margin: 0;
`;

export default function App() {
  const [active, setActive] = useState(false);
  return (
    <div>
      <Item data-testid="item" $active={active} $pad={12}>
        dynamic mixin
      </Item>
      <button data-testid="toggle" onClick={() => setActive((current) => !current)}>
        toggle
      </button>
    </div>
  );
}
