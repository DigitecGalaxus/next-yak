import { globalStyle } from "@yak/react";

function Component() {
  globalStyle`
    body {
      margin: 0;
    }
  `;
  return null;
}
