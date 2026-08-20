import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { yak } from "@yak/solid/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

// Discover all .html entry points for multi-page build
const htmlEntries: Record<string, string> = {};
for (const file of readdirSync(__dirname)) {
  if (file.endsWith(".html")) {
    htmlEntries[file.replace(".html", "")] = resolve(__dirname, file);
  }
}

// Two-mode e2e, inverted relative to the react bundlers because folding
// defaults to off for Solid: opt in to static folding unless
// YAK_E2E_FOLD_STATIC requests the off pass.
const yakOptions = process.env.YAK_E2E_FOLD_STATIC === "false" ? {} : { foldStatic: true };

export default defineConfig({
  plugins: [yak(yakOptions), solid()],
  build: {
    rollupOptions: {
      input: htmlEntries,
    },
  },
});
