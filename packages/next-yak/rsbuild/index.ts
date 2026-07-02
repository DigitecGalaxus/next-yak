import { fileURLToPath } from "node:url";
import type { RsbuildPlugin } from "@rsbuild/core";
import {
  buildYakPluginOptions,
  resolveYakContext,
  type YakConfigOptions,
} from "../withYak/index.js";

// Rspack's loader context is webpack-compatible but does NOT implement
// `this.loadModule` (the webpack API the webpack-loader relies on). It does
// provide `this.fs.readFile`, `this.getResolve` and `this.addDependency` — which
// is exactly what the turbopack loader uses — so the turbopack loader runs as-is
// on Rspack. The compiled loader lives next to this file under dist/
// (dist/rsbuild/index.js and dist/loaders/turbo-loader.cjs are siblings).
const rspackLoaderPath = fileURLToPath(new URL("../loaders/turbo-loader.cjs", import.meta.url));

/**
 * Rsbuild plugin for next-yak.
 *
 * Wires the yak-swc transform as an Rspack `pre` loader that runs the
 * compile-time CSS extraction in-loader and inlines the result as a
 * `data:text/css;base64,` import (the same strategy as the Turbopack loader).
 * Running it as a `pre` loader keeps yak-swc out of Rsbuild's own
 * `builtin:swc-loader`, so it composes cleanly with that pass (TS/JSX, React
 * Fast Refresh, and the React Compiler).
 *
 * @example
 * ```ts
 * // rsbuild.config.ts
 * import { defineConfig } from "@rsbuild/core";
 * import { pluginReact } from "@rsbuild/plugin-react";
 * import { pluginYak } from "next-yak/rsbuild";
 *
 * export default defineConfig({
 *   plugins: [pluginReact(), pluginYak()],
 * });
 * ```
 */
export function pluginYak(yakOptions: YakConfigOptions = {}): RsbuildPlugin {
  return {
    name: "next-yak",
    setup(api) {
      api.modifyRspackConfig((config) => {
        const rootContext = api.context.rootPath;
        const yakPluginOptions = {
          ...buildYakPluginOptions(yakOptions, rootContext),
          importMode: {
            value: "data:text/css;base64,",
            transpilation: "Css",
            encoding: "Base64",
          },
        };

        config.module ??= {};
        config.module.rules ??= [];
        config.module.rules.push(
          {
            test: /\.(c|m)?[jt]sx?$/,
            exclude: /[\\/]node_modules[\\/]/,
            enforce: "pre",
            use: [
              {
                loader: rspackLoaderPath,
                options: { yakOptions, yakPluginOptions },
              },
            ],
          },
          // The extracted CSS is inlined as a `data:text/css;base64,` import.
          // Rspack parses unknown data URIs as JavaScript, so tell it these are
          // CSS modules. `css/auto` keeps Rspack's native CSS handling for them.
          {
            mimetype: "text/css",
            type: "css/auto",
          },
        );

        // Custom context file (`yak.context.{ts,tsx,js,jsx}`) for server-aware
        // theming, mirroring the webpack/turbopack integrations.
        const yakContext = resolveYakContext(yakOptions.contextPath, rootContext);
        if (yakContext) {
          config.resolve ??= {};
          config.resolve.alias = {
            ...config.resolve.alias,
            "next-yak/context/baseContext": yakContext,
          };
        }
      });
    },
  };
}

export type { YakConfigOptions };
