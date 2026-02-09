import { styled } from "next-yak";
import { typography } from "./typography.yak.ts";

const Headline = styled.h1`
  color: red;
  ${typography.h1};
`;

const Subheading = styled.h3`
  color: blue;
  ${typography.h3};
`;

export default function App() {
  return (
    <>
      <Headline data-testid="headline">Headline</Headline>
      <Subheading data-testid="subheading">Subheading</Subheading>
    </>
  );
}
