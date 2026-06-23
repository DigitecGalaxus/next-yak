import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginYak } from "next-yak/rsbuild";

export default defineConfig({
  plugins: [pluginReact(), pluginYak()],
});
