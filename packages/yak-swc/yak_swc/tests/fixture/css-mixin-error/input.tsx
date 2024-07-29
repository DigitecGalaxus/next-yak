import { styled, css } from "next-yak";

const buttonStyles = css`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  ${({ $active }) => $active && css`
    background-color: #f0f0f0;
    max-width: ${({ $letters }) => $letters * 15}px;
  `}
  width: ${({ $letters }) => $letters * 10}px;
  ${function ({ $letters }) {
    return $letters > 5 && css`
      color: red;
    `;
  }}
`;

export const Wrapper = styled.button`
   button {
      ${buttonStyles}
   }
`;

