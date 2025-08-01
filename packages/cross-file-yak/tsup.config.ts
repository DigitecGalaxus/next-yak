import { defineConfig } from "tsup";

export default defineConfig([
  {
    entryPoints: ["src/index.ts"],
    format: "esm",
    minify: false,
    sourcemap: true,
    clean: false,
    splitting: false,
    dts: true,
    platform: "node",
    external: [],
    target: "es2022",
    outDir: "dist/src",
  },
]);
