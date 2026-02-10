/** @jsxImportSource next-yak */
import { styled, css } from "next-yak";

const highlight = css`
  color: red;
`;

const Box = styled.div`
  ${highlight}
  font-size: 20px;
`;

export default function App() {
  return (
    <>
      <Box data-testid="styled-mixin">Styled with mixin</Box>
      <div
        data-testid="css-prop-mixin"
        css={css`
          ${highlight}
          font-size: 16px;
        `}
      >
        CSS prop with mixin
      </div>
    </>
  );
}
