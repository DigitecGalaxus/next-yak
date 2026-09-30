import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginYak } from "@yak/react/rsbuild";

export default defineConfig({
  plugins: [pluginReact(), pluginYak()],
});
