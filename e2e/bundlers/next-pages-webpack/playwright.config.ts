import { resolve } from "node:path";
import { basePlaywrightConfig } from "../../playwright-base.ts";

const nextBin =
  resolve(import.meta.dirname, "node_modules/.bin/next") +
  (process.platform === "win32" ? ".cmd" : "");

export default basePlaywrightConfig({
  name: "next-pages-webpack",
  url: "/",
  webServer: {
    port: 3003,
    command: `"${nextBin}" dev --webpack -p 3003`,
    timeout: 120_000,
  },
});
