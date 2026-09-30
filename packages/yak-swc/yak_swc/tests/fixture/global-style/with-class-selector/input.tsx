import { globalStyle } from "@yak/react";

// Markup rendered by third-party code (map widgets, markdown, CMS content)
// ships fixed class names. yak writes plain CSS, so the class name stays as written.
globalStyle`
  .maps {
    border: 1px solid black;
  }
`;
