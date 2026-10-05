import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["index.ts"],
  dts: true,
  sourcemap: true,
  target: "es2022",
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
});
