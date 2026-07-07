import { globalCss } from "next-yak";

// A module which only declares global styles and nothing else.
// The side-effect CSS import must still be injected.
globalCss`
  html {
    color-scheme: light dark;
  }
`;
