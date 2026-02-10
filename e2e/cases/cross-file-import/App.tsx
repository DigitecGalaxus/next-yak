import { styled } from "next-yak";
import { primary, tokens } from "./colors.ts";
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

export default function App() {
  return (
    <>
      <PrimaryBox data-testid="primary">Purple</PrimaryBox>
      <OrangeBox data-testid="orange">Orange</OrangeBox>
      <DefaultBox data-testid="default">Teal</DefaultBox>
    </>
  );
}
