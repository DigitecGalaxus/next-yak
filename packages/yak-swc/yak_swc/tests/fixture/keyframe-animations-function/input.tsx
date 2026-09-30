import { styled, css, keyframes } from "@yak/react";

export const FadeInText = styled.p<{ $reverse?: boolean }>`
  ${({ $reverse }) => $reverse ? css`
    animation: ${fadeOut} 1s ease-in;
    ` : css`
    animation: ${fadeIn} 1s ease-in;
  `}
  
  font-size: 18px;
  color: #333;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;