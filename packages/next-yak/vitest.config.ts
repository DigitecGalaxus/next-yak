/// <reference types="vitest" />
/// <reference types="vite/client" />
import { fileURLToPath, URL } from 'url';
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    testTimeout: 10000,
    server: {
      deps: {
        // Run isolated-source-eval modules outside Vite's transform pipeline
        // so that import.meta.url returns a proper file:// URL
        external: [/\/isolated-source-eval\//],
      },
    },
  },
  resolve: {
    // Use typescript files during tests
    alias: {
      "next-yak": fileURLToPath(new URL('./runtime', import.meta.url)),
    },
  },
});
