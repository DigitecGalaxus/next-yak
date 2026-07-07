import { globalCss } from "next-yak/internal";
function Component() {
    globalCss`
    body {
      margin: 0;
    }
  `;
    return null;
}
