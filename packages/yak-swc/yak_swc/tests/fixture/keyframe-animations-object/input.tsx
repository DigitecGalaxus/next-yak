import { styled, css, keyframes } from "@yak/react";

export const FadeInText = styled.p<{ $reverse?: boolean }>`
  ${({ $reverse }) =>
    $reverse
      ? css`
          animation: ${animations.fadeOut} 1s ease-in;
        `
      : css`
          animation: ${animations.fadeIn} 1s ease-in;
        `}

  font-size: 18px;
  color: #333;
`;

const animations = {
  fadeIn: keyframes`
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
`,
  fadeOut: keyframes`
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
`,
};

const slides = {
  200: keyframes`
    to {
      transform: translate(200px, 200px);
    }
`,
  "x400": keyframes`
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(400px);
    }
`,
};

export const FancyButton = styled.button`
  background-color: #f00;
  animation: ${slides.x400} 1s ease-in-out, ${animations.fadeIn} 1s ease-in;
  &:hover {
    animation: ${slides["200"]} 1s ease-in-out, ${animations.fadeOut} 1s ease-in;
  }
`;