import { globalStyles, css } from "next-yak";

const brand = "#6b21ff";
const spacing = 8;

const focusRing = css`
  outline: 2px solid ${brand};
  outline-offset: 2px;
`;

globalStyles`
  :root {
    --color-brand: ${brand};
    --spacing: ${spacing}px;
  }

  a:focus-visible {
    ${focusRing}
  }
`;
