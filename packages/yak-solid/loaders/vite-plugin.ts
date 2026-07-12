import type { Plugin } from "vite";
import { viteYak, type ViteYakPluginOptions } from "next-yak/vite";

export type ViteYakSolidOptions = Omit<ViteYakPluginOptions, "library">;

/**
 * Vite plugin for @yak/solid.
 *
 * Runs the yak SWC transform (with `enforce: "pre"`) before vite-plugin-solid,
 * so css`` / styled`` template literals and the css prop are compiled away
 * before Solid's JSX compiler sees the file.
 *
 * @usage
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from "vite";
 * import solid from "vite-plugin-solid";
 * import { viteYakSolid } from "@yak/solid/vite";
 *
 * export default defineConfig({
 *   plugins: [viteYakSolid(), solid()],
 * });
 * ```
 */
export function viteYakSolid(options: ViteYakSolidOptions = {}): Promise<Plugin> {
  return viteYak({
    ...options,
    library: {
      name: "@yak/solid",
      // vite-plugin-solid owns HMR for Solid components
      reactRefreshReg: false,
      excludePattern: /packages\/yak-solid/,
    },
  });
}
