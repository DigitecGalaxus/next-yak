import { globalStyles, keyframes } from "next-yak";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

globalStyles`
  ::view-transition-new(root) {
    animation: ${fadeIn} 200ms ease;
  }
`;
