import { defineConfig } from "tsup";

export default defineConfig([
  {
    entryPoints: ["index.ts"],
    dts: true,
    format: ["esm"],
    minify: false,
    sourcemap: true,
    clean: true,
    external: [],
    target: "es2022",
    outDir: "dist",
  },
]);
