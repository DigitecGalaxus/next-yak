import { createViteYakPlugin } from "yak-internals/vite-plugin-core";

export type { ViteYakPluginOptions as ViteYakQwikOptions } from "yak-internals/vite-plugin-core";

/**
 * Vite plugin for @yak/qwik: compiles the css``, styled`` and css prop
 * styles in your source code to plain CSS at build time.
 *
 * Add it before Qwik's plugin so it sees your original source code.
 *
 * @usage
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from "vite";
 * import { qwikVite } from "@qwik.dev/core/optimizer";
 * import { yak } from "@yak/qwik/vite";
 *
 * export default defineConfig({
 *   plugins: [yak(), qwikVite()],
 * });
 * ```
 */
export const yak = createViteYakPlugin({
  name: "@yak/qwik",
  // qwikVite owns HMR for Qwik components
  reactRefreshReg: false,
  excludePattern: /packages\/yak-qwik/,
  foldStatic: true,
});
