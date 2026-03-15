import { resolve } from "node:path";
import { basePlaywrightConfig } from "../../playwright-base.ts";

const nextBin =
  resolve(import.meta.dirname, "node_modules/.bin/next") +
  (process.platform === "win32" ? ".cmd" : "");

export default basePlaywrightConfig({
  name: "next-pages-rspack",
  url: "/",
  webServer: {
    port: 3006,
    command: `"${nextBin}" dev -p 3006`,
    timeout: 120_000,
  },
});
