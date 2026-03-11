import { resolve } from "node:path";
import { basePlaywrightConfig } from "../../playwright-base.ts";

const nextBin =
  resolve(import.meta.dirname, "node_modules/.bin/next") +
  (process.platform === "win32" ? ".cmd" : "");

export default basePlaywrightConfig({
  name: "next-pages-turbopack",
  url: "/",
  webServer: {
    port: 3004,
    command: `"${nextBin}" dev --turbopack -p 3004`,
    timeout: 120_000,
  },
});
