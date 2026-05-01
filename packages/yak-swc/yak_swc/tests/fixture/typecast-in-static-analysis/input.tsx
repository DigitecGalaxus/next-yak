import { styled, css } from "next-yak";

// Numeric constants used inside math expressions, in cast form
const BASE = 16 as const;
const SIZES = { sm: 8, md: 16 } as const;

// Math evaluator: cast-wrapped numbers and references must still evaluate
const A = styled.div`
  width: ${(BASE as number) * 2}px;
  margin: ${(SIZES.sm as number) + (SIZES.md satisfies number)}px;
  padding: ${BASE! / 2}px;
`;

// Selector reference wrapped in a cast inside a CSS interpolation
const Box = styled.div``;
const B = styled.div`
  ${(Box as typeof Box)} {
    color: red;
  }
`;

// Constant lookup through a non-null assertion
const COLOR = "blue";
const C = styled.div`
  color: ${COLOR!};
`;

// Default export through a TS cast
const Page = styled.div`
  display: block;
`;
export default Page as typeof Page;
