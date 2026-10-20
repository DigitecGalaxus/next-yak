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

const media = {
  up: (width: string) => `@media (min-width: ${width})`,
};

export const DynamicMediaQuery = styled.div`
  ${media.up("768px")} {
    color: red;
  }
`;

const desktop = "@media (min-width: 768px)";

export const ConstantMediaQuery = styled.div`
  ${desktop} {
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

export const UnclosedMediaQuery = styled.div`
  @media (min-width: 600px {
    color: red;
  }
`;

export const UnclosedFunction = styled.div<{ $deg: number }>`
  transform: rotate(${(p) => p.$deg}deg;
  color: red;
`;

export const CustomPropertyBlock = styled.div`
  --mixin: { color: red };
  color: blue;
`;
