import { styled, keyframes } from "@yak/react";

export const Button = styled.button`
  ${keyframes`
    from {
      opacity: 0;
      }
      to {
        opacity: 1;
      }
    `};
`;
