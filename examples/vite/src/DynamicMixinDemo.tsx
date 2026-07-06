import { useState } from "react";
import { styled } from "next-yak";
import { highlight } from "./dynamicMixin";
import { card } from "./outerMixin";

const DemoText = styled.p<{ $active: boolean }>`
  padding: 4px;
  ${highlight};
`;

const NestedDemo = styled.p<{ $active: boolean }>`
  padding: 4px;
  ${card};
`;

export const DynamicMixinDemo = () => {
  const [active, setActive] = useState(false);
  return (
    <div>
      <DemoText $active={active} data-testid="dynamic-mixin-text">
        Cross-file dynamic mixin: {active ? "active = red + underline" : "inactive = black italic"}
      </DemoText>
      <NestedDemo $active={active} data-testid="dynamic-mixin-nested">
        Recursive mixin (mixin in mixin): {active ? "red dashed border" : "gray dashed border"}
      </NestedDemo>
      <button type="button" onClick={() => setActive(!active)} data-testid="dynamic-mixin-toggle">
        Toggle dynamic mixin
      </button>
    </div>
  );
};
