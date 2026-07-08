import { globalCss } from "next-yak";

// Styling markup rendered by third-party code (map widgets, markdown, CMS
// content) — the class name is a fixed contract, it must never be hashed.
// `:global(...)` is the portable form: css-loader unwraps it on webpack and
// yak unwraps it for native CSS pipelines, so the same source works everywhere.
globalCss`
  :global(.maps) {
    border: 1px solid black;
  }

  :global(.legacy-widget:has(.icon)) {
    color: red;
  }
`;
