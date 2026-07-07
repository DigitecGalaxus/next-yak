import { globalCss } from "next-yak";

function Component() {
  globalCss`
    body {
      margin: 0;
    }
  `;
  return null;
}
