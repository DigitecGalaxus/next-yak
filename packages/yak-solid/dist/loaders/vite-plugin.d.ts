import { ViteYakPluginOptions } from "next-yak/vite";
import { Plugin } from "vite";

//#region loaders/vite-plugin.d.ts
type ViteYakSolidOptions = Omit<ViteYakPluginOptions, "library">;
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
declare function viteYakSolid(options?: ViteYakSolidOptions): Promise<Plugin>;
//#endregion
export { ViteYakSolidOptions, viteYakSolid };
//# sourceMappingURL=vite-plugin.d.ts.map