import { globalStyle, css } from "@yak/react";

const brand = "#6b21ff";
const spacing = 8;

const focusRing = css`
  outline: 2px solid ${brand};
  outline-offset: 2px;
`;

globalStyle`
  :root {
    --color-brand: ${brand};
    --spacing: ${spacing}px;
  }

  a:focus-visible {
    ${focusRing}
  }
`;
