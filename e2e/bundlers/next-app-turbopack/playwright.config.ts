import { resolve } from "node:path";
import { basePlaywrightConfig } from "../../playwright-base.ts";

const nextBin =
  resolve(import.meta.dirname, "node_modules/.bin/next") +
  (process.platform === "win32" ? ".cmd" : "");

export default basePlaywrightConfig({
  name: "next-app-turbopack",
  url: "/",
  webServer: {
    port: 3002,
    command: `"${nextBin}" dev --turbopack -p 3002`,
    timeout: 120_000,
  },
});
