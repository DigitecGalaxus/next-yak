import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Server build of the runtime: `@solidjs/web` resolves to its server entry
// through the `node` condition, so `isServer` is true and rendering goes
// through `renderToString`.
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["runtime/__tests__/ssr/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@yak/solid/context/baseContext": fileURLToPath(
        new URL("./runtime/context/baseContext.ts", import.meta.url),
      ),
      "@yak/solid/context": fileURLToPath(new URL("./runtime/context/index.ts", import.meta.url)),
      "@yak/solid/internal": fileURLToPath(new URL("./runtime/internal.ts", import.meta.url)),
      "@yak/solid": fileURLToPath(new URL("./runtime/index.ts", import.meta.url)),
    },
    conditions: ["node"],
  },
});
