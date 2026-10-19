import { globalStyle } from "@yak/react";

globalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :root {
    --spacing: 4px;
    --color-brand: #6b21ff;
  }

  body {
    margin: 0;
    font-family: sans-serif;
  }

  .sr-only {
    position: absolute;
    width: 1px;
  }
`;
