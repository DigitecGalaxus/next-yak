import { styled } from "next-yak";

// Identical prop arrow used in two declarations
const TwiceSameArrow = styled.div<{ $x: number }>`
  left: ${({ $x }) => $x}px;
  right: ${({ $x }) => $x}px;
`;

// Identical logic, but one side carries a TS parameter annotation
const TypedVsUntyped = styled.div<{ $y: number }>`
  top: ${({ $y }) => $y}px;
  bottom: ${({ $y }: { $y: number }) => $y}px;
`;

// Identical calculation including a Math.min call
const WithCalculation = styled.div<{ $ratio: number }>`
  width: ${({ $ratio }) => Math.min($ratio * 100, 100)}%;
  max-width: ${({ $ratio }) => Math.min($ratio * 100, 100)}%;
`;

// Same expression but different trailing units: must stay separate
const DifferentUnits = styled.div<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}rem;
`;

// Parenthesized arrow vs plain arrow
const Parens = styled.div<{ $z: number }>`
  margin-left: ${({ $z }) => $z}px;
  margin-right: ${(({ $z }) => $z)}px;
`;

// Different props: must stay separate
const DifferentProps = styled.div<{ $a: number; $b: number }>`
  padding-left: ${({ $a }) => $a}px;
  padding-right: ${({ $b }) => $b}px;
`;

// Same bindings, different destructuring order in the parameter
const DestructureOrder = styled.div<{ $a: number; $b: number }>`
  width: ${({ $a, $b }) => $a * $b}px;
  height: ${({ $b, $a }) => $a * $b}px;
`;

// A sibling-referencing default: reordering changes behavior
const DefaultReferencesSibling = styled.div<{ $a: number; $b?: number }>`
  min-width: ${({ $a, $b = $a }) => $a * $b}px;
  min-height: ${({ $b = 1, $a }) => $a * $b}px;
`;

// Repeated interpolations inside a single declaration value
const Dot = styled.div<{ $index: number; $slideCount: number }>`
  animation-range:
    max(0%, calc((${({ $index }) => $index} - 1) * 100% / (${({ $slideCount }) => $slideCount} - 1)))
    min(100%, calc((${({ $index }) => $index} + 1) * 100% / (${({ $slideCount }) => $slideCount} - 1)));
`;
