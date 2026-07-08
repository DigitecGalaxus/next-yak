import { globalStyles } from "next-yak";

function Component() {
  globalStyles`
    body {
      margin: 0;
    }
  `;
  return null;
}
