import { globalStyle } from "@yak/react/internal";
function Component() {
    globalStyle`
    body {
      margin: 0;
    }
  `;
    return null;
}
