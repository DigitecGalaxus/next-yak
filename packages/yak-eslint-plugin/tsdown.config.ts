import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["index.ts"],
  dts: true,
  sourcemap: true,
  target: "es2022",
  outExtensions: ({ format }) => ({
    js: format === "cjs" ? ".cjs" : ".js",
    dts: format === "cjs" ? ".d.cts" : ".d.ts",
  }),
});
