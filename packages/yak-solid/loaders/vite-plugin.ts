import { createViteYakPlugin } from "yak-internals/vite-plugin-core";

export type { ViteYakPluginOptions as ViteYakSolidOptions } from "yak-internals/vite-plugin-core";

/**
 * Vite plugin for @yak/solid: compiles the css``, styled`` and css prop
 * styles in your source code to plain CSS at build time.
 *
 * Add it before the framework's plugin so it sees your original source code.
 *
 * @usage
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from "vite";
 * import solid from "vite-plugin-solid";
 * import { yak } from "@yak/solid/vite";
 *
 * export default defineConfig({
 *   plugins: [yak(), solid()],
 * });
 * ```
 */
export const yak = createViteYakPlugin({
  name: "@yak/solid",
  // vite-plugin-solid owns HMR for Solid components
  reactRefreshReg: false,
  excludePattern: /packages\/yak-solid/,
  // off by default: not all edge-cases are tested yet, so a correct
  // result can't be guaranteed everywhere
  foldStatic: false,
});
