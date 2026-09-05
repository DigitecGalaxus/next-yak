import { styled } from "next-yak";
import { Marker } from "./marker.tsx";

const Styled = styled.div`
  color: red;
`;

export default function App() {
  return (
    <>
      <Marker />
      <Styled data-testid="styled">Red</Styled>
    </>
  );
}
