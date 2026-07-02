import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/rsbuild";
import { pluginYak } from "next-yak/rsbuild";

// TanStack Start (SSR) on Rsbuild. tanstackStart() wires the server/client
// entries and file-based routing; pluginYak() adds the yak-swc pre loader.
// `splitChunks: false` follows the Start + Rsbuild setup from the docs. This
// verifies next-yak/rsbuild works through the Start SSR build pipeline.
export default defineConfig({
  plugins: [pluginReact({ splitChunks: false }), tanstackStart(), pluginYak()],
});
