import { css, keyframes } from "next-yak";

const pulse = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0.5;
  }
`;

export const highlight = css<{ $active: boolean; $pad: number }>`
  font-style: italic;
  animation: ${pulse} 1s infinite alternate;
  padding-left: ${({ $pad }) => $pad}px;
  ${({ $active }) =>
    $active &&
    css`
      color: red;
      text-decoration: underline;
    `}
`;
