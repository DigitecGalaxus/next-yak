import { styled } from "next-yak";
import { screenQueries } from "./queries.yak.ts";

const Title = styled.h1`
  font-size: 16px;

  @media (min-width: 800px) {
    font-size: 24px;
  }
`;

const MobileHidden = styled.div`
  display: block;

  ${screenQueries.mobile} {
    display: none;
  }
`;

export default function App() {
  return (
    <>
      <Title data-testid="title">Responsive</Title>
      <MobileHidden data-testid="mobile-hidden">Desktop only</MobileHidden>
    </>
  );
}
