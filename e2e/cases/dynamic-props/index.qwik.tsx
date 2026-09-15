import { component$ } from "@qwik.dev/core";
import { styled, css } from "@yak/qwik";

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

export default component$(() => (
  <>
    <Bar data-testid="bar-active" $width={200} $active={true} />
    <Bar data-testid="bar-inactive" $width={100} $active={false} />
  </>
));
