import { globalCss, keyframes } from "next-yak";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

globalCss`
  ::view-transition-new(root) {
    animation: ${fadeIn} 200ms ease;
  }
`;
