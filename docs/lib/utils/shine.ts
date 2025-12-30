import { css, keyframes } from "next-yak";

const shine = keyframes`
  0% {
      background-position-x: 100%;
    }
    to {
      background-position-x: 0%;
    }
  `;

export const shineAnimation = css`
  &:after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 12px;
  }

  &:hover:after {
    background: linear-gradient(
        -45deg,
        hsla(0, 0%, 96%, 0%) 40%,
        hsla(0, 0%, 100%, 80%) 50%,
        hsla(0, 0%, 96%, 0%) 60%
      )
      0%/ 300%;
    animation: ${shine} 0.5s linear;
  }
`;
