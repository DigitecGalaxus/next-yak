import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  plugins: [wasm()],
  build: {
    minify: false,
    target: "esnext",
    outDir: "dist",
  },
});
