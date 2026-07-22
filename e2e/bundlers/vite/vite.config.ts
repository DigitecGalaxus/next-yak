import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react-swc";
import { viteYak } from "next-yak/vite";
import { defineConfig } from "vite";

// Discover all .html entry points for multi-page build
const htmlEntries: Record<string, string> = {};
for (const file of readdirSync(__dirname)) {
  if (file.endsWith(".html")) {
    htmlEntries[file.replace(".html", "")] = resolve(__dirname, file);
  }
}

// Two-mode e2e: opt out of static folding only when YAK_E2E_FOLD_STATIC is
// "false". Otherwise pass no foldStatic key so the config stays inert.
const yakOptions = process.env.YAK_E2E_FOLD_STATIC === "false" ? { foldStatic: false } : {};

export default defineConfig({
  plugins: [react(), viteYak(yakOptions)],
  build: {
    rollupOptions: {
      input: htmlEntries,
    },
  },
});
