import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 10000,
    server: {
      deps: {
        // Run isolated-source-eval modules outside Vite's transform pipeline
        // so that import.meta.url returns a proper file:// URL
        external: [/\/isolated-source-eval\//],
      },
    },
  },
});
