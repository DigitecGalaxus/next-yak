import { styled, css } from "@yak/react";

const buttonStyles = css`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  @media (max-width: 600px) {
    ${({ $active }) => $active && css`
      background-color: #f0f0f0;
      max-width: ${({ $letters }) => $letters * 15}px;
    `}
  }
  width: ${({ $letters }) => $letters * 10}px;
`;

export const ThemedButton = styled.button`
   ${buttonStyles}
`;

export const CustomThemedButton = styled.button`
  color: red;
  &:not([disabled]) {
     ${buttonStyles}
  }
`; 