import { styled, css } from "@yak/react";

export const EmptySelector = styled.div`
  color: red;
  { color: blue; }
`;

export const DynamicSelector = styled.div<{ $selector: string }>`
  ${(p) => p.$selector} {
    color: red;
  }
`;

export const MissingColon = styled.div`
  color red;
  .foo { margin 0 }
  padding: 0;
`;

export const missingColonAtEnd = css`
  padding: 0;
  color red
`;

export const AtRules = styled.div`
  @media (min-width: 640px) {
    color: red;
  }
`;
