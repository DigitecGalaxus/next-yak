/// <reference types="vitest" />
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  // plugins: [codspeedPlugin()],
  test: {
    benchmark: {
      include: ["./build-performance/**/*.{bench,benchmark}.?(c|m)[jt]s?(x)"],
      outputJson: "./build-performance.json",
      compare: "./build-performance.json",
    },
  },
});
