import { globalStyle } from "next-yak";

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

  /* class selectors that must stay global in CssModule mode use :global() */
  :global(.sr-only) {
    position: absolute;
    width: 1px;
  }
`;
