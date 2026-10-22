import { styled } from "@yak/qwik";
import { mixinBackground } from "./img/background";
import { ImageBox } from "./img/Img";

const MixinBox = styled.div`
  width: 40px;
  height: 40px;
  ${mixinBackground};
`;

export default function App() {
  return (
    <>
      <ImageBox data-testid="same-file" />
      <MixinBox data-testid="cross-file-mixin" />
    </>
  );
}
