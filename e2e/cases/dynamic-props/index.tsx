import { styled, css } from "next-yak";

const Bar = styled.div<{ $width: number; $active: boolean }>`
  height: 20px;
  width: ${(props) => props.$width}px;
  ${(props) =>
    props.$active
      ? css`
          background-color: green;
        `
      : css`
          background-color: gray;
        `}
`;

export default function App() {
  return (
    <>
      <Bar data-testid="bar-active" $width={200} $active={true} />
      <Bar data-testid="bar-inactive" $width={100} $active={false} />
    </>
  );
}
