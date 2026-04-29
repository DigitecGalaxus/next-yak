import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    preset: "src/preset.ts",
  },
  dts: true,
  sourcemap: true,
  deps: {
    neverBundle: ["next-yak", "yak-swc", "storybook"],
  },
  target: "node20",
  platform: "node",
  outExtensions: ({ format }) => ({
    js: format === "cjs" ? ".cjs" : ".js",
    dts: format === "cjs" ? ".d.cts" : ".d.ts",
  }),
});
