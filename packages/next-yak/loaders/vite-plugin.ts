import { createViteYakPlugin } from "yak-internals/vite-plugin-core";

export type { ViteYakPluginOptions } from "yak-internals/vite-plugin-core";

/**
 * Vite plugin for next-yak: compiles the css``, styled`` and css prop
 * styles in your source code to plain CSS at build time.
 *
 * Add it before the framework's plugin so it sees your original source code.
 *
 * @usage
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from "vite";
 * import react from "@vitejs/plugin-react-swc";
 * import { viteYak } from "next-yak/vite";
 *
 * export default defineConfig({
 *   plugins: [viteYak(), react()],
 * });
 * ```
 */
export const viteYak = createViteYakPlugin({
  name: "next-yak",
  reactRefreshReg: true,
  excludePattern: /packages\/next-yak/,
  foldStatic: true,
});
