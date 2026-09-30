import { globalStyle, keyframes } from "@yak/react";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

globalStyle`
  ::view-transition-new(root) {
    animation: ${fadeIn} 200ms ease;
  }
`;
