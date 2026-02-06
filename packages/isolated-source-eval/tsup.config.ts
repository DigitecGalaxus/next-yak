import { defineConfig } from "tsup";

export default defineConfig([
  {
    entryPoints: ["src/index.ts"],
    format: ["esm"],
    sourcemap: true,
    clean: true,
    dts: true,
    target: "es2022",
    outDir: "dist",
  },
  // Worker is loaded at runtime via new URL("./worker.js", import.meta.url)
  // and must be a separate file — not bundled into the main entry.
  {
    entryPoints: ["src/worker.ts"],
    format: ["esm"],
    sourcemap: true,
    clean: false,
    dts: false,
    target: "es2022",
    outDir: "dist",
  },
]);
