import { resolve } from "node:path";
import { basePlaywrightConfig } from "../../playwright-base.ts";

const viteBin =
  resolve(import.meta.dirname, "node_modules/.bin/vite") +
  (process.platform === "win32" ? ".cmd" : "");

export default basePlaywrightConfig({
  name: "vite",
  url: "/index.html",
  webServer: {
    port: 5173,
    command: `"${viteBin}" --port 5173`,
    timeout: 30_000,
  },
});
