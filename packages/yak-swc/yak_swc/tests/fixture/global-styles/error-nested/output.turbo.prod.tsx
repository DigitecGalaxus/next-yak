import { globalStyles } from "next-yak/internal";
function Component() {
    globalStyles`
    body {
      margin: 0;
    }
  `;
    return null;
}
