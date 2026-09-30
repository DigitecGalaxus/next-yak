import { styled, keyframes } from "@yak/react";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const FadeInText = styled.p`
  animation: ${fadeIn} 1s ease-in;
  font-size: 18px;
  color: #333;
`;
