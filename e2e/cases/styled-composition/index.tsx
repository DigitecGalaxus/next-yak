import { styled } from "next-yak";

const Base = styled.div`
  color: red;
  padding: 8px;
  font-weight: normal;
`;

const Extended = styled(Base)`
  font-weight: bold;
  padding: 16px;
`;

export default function App() {
  return (
    <>
      <Base data-testid="base">Base</Base>
      <Extended data-testid="extended">Extended</Extended>
    </>
  );
}
