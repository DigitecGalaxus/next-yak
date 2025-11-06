import react from "@vitejs/plugin-react-swc";
import { viteYak } from "next-yak/vite";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  plugins: [react(), viteYak()],
  css: {},
});
