import { globalStyle } from "next-yak";

function Component() {
  globalStyle`
    body {
      margin: 0;
    }
  `;
  return null;
}
