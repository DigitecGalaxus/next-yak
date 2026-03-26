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

export default defineConfig({
  plugins: [react(), viteYak()],
  build: {
    rollupOptions: {
      input: htmlEntries,
    },
  },
});
