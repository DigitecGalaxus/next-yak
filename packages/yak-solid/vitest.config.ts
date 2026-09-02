import { fileURLToPath } from "node:url";
import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // vite-plugin-solid compiles the JSX in test files with babel-preset-solid
  plugins: [solid()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["runtime/__tests__/**/*.test.{ts,tsx}"],
  },
  resolve: {
    // run tests against the uncompiled TS runtime
    alias: {
      "@yak/solid/context/baseContext": fileURLToPath(
        new URL("./runtime/context/baseContext.ts", import.meta.url),
      ),
      "@yak/solid/context": fileURLToPath(new URL("./runtime/context/index.ts", import.meta.url)),
      "@yak/solid/internal": fileURLToPath(new URL("./runtime/internal.ts", import.meta.url)),
      "@yak/solid": fileURLToPath(new URL("./runtime/index.ts", import.meta.url)),
    },
    conditions: ["browser", "development"],
  },
});
