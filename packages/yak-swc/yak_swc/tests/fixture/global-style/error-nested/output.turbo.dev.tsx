import { globalStyle } from "next-yak/internal";
function Component() {
    globalStyle`
    body {
      margin: 0;
    }
  `;
    return null;
}
