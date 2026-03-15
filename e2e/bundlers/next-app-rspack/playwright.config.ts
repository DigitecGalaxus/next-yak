import { resolve } from "node:path";
import { basePlaywrightConfig } from "../../playwright-base.ts";

const nextBin =
  resolve(import.meta.dirname, "node_modules/.bin/next") +
  (process.platform === "win32" ? ".cmd" : "");

export default basePlaywrightConfig({
  name: "next-app-rspack",
  url: "/",
  webServer: {
    port: 3005,
    command: `"${nextBin}" dev -p 3005`,
    timeout: 120_000,
  },
});
