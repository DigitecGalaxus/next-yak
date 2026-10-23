import { styled } from "@yak/react";
import { halfNegativeSpace, negativeGap, primary, tokens } from "./colors.ts";
import defaultColor from "./colors.ts";

const PrimaryBox = styled.div`
  color: ${primary};
`;

const OrangeBox = styled.div`
  color: ${tokens.colors.orange};
`;

const DefaultBox = styled.div`
  color: ${defaultColor};
`;

const NegativeGapBox = styled.div`
  margin-left: ${negativeGap};
`;

const HalfNegativeSpaceBox = styled.div`
  margin-left: ${halfNegativeSpace};
`;

const localGap = "30px";
const localNegativeGap = `-${localGap}`;

const LocalNegativeGapBox = styled.div`
  margin-left: ${localNegativeGap};
`;

export default function App() {
  return (
    <>
      <PrimaryBox data-testid="primary">Purple</PrimaryBox>
      <OrangeBox data-testid="orange">Orange</OrangeBox>
      <DefaultBox data-testid="default">Teal</DefaultBox>
      <NegativeGapBox data-testid="negative-gap">-20px</NegativeGapBox>
      <HalfNegativeSpaceBox data-testid="half-negative-space">-10px</HalfNegativeSpaceBox>
      <LocalNegativeGapBox data-testid="local-negative-gap">-30px</LocalNegativeGapBox>
    </>
  );
}
