import { fileURLToPath } from "node:url";
import type { RsbuildPlugin, Rspack } from "@rsbuild/core";

/**
 * Fails the build when the yak loader hands on its source map as a JSON string.
 * Loaders such as babel-loader only accept an object map.
 * See: https://github.com/DigitecGalaxus/next-yak/pull/675
 */
export function pluginSourceMapCheck(): RsbuildPlugin {
  return {
    name: "source-map-check",
    setup(api) {
      // Register the loader from this file after the yak loader
      api.modifyRspackConfig((config) => {
        config.module ??= {};
        config.module.rules ??= [];
        config.module.rules.unshift({
          test: /\.(c|m)?[jt]sx?$/,
          exclude: /[\\/]node_modules[\\/]/,
          enforce: "pre",
          loader: fileURLToPath(import.meta.url),
        });
      });
    },
  };
}

const sourceMapCheckLoader: Rspack.LoaderDefinition = function (code, map) {
  if (typeof map === "string") {
    throw new Error("The yak loader must hand on its source map as an object, not a string");
  }
  this.callback(null, code, map);
};

export default sourceMapCheckLoader;
