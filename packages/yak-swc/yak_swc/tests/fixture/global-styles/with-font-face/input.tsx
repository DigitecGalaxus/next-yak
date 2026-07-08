import { globalStyles } from "next-yak";

globalStyles`
  @font-face {
    font-family: "Inter";
    src: url("/fonts/inter.woff2") format("woff2");
    font-display: swap;
  }

  @property --progress {
    syntax: "<percentage>";
    inherits: false;
    initial-value: 0%;
  }

  body {
    font-family: "Inter", sans-serif;
  }
`;
