import type { LoaderContext } from "webpack";
import type { YakConfigOptions } from "../withYak/index.js";
import { createDebugLogger } from "./lib/debugLogger.js";
import { extractCss } from "./lib/extractCss.js";
import { resolveCrossFileConstant } from "./lib/resolveCrossFileSelectors.js";

/**
 * Transform typescript to css
 *
 * This loader takes the cached result from the yak tsloader
 * and extracts the css from the generated comments
 */
export default async function cssExtractLoader(
  this: LoaderContext<YakConfigOptions>,
  // Instead of the source code, we receive the extracted css
  // from the yak-swc transformation
  _code: string,
  sourceMap: string | undefined,
): Promise<string | void> {
  const callback = this.async();
  // Load the module from the original typescript request (without !=! and the query)
  return this.loadModule(this.resourcePath, (err, source) => {
    if (err) {
      return callback(err);
    }
    if (!source) {
      return callback(
        new Error(`Source code for ${this.resourcePath} is empty`),
      );
    }
    const { experiments } = this.getOptions();
    const debugLog = createDebugLogger(
      experiments?.debug,
      this._compiler?.context ?? process.cwd(),
    );

    debugLog("ts", source, this.resourcePath);
    const css = extractCss(source, experiments?.transpilationMode);
    debugLog("css", css, this.resourcePath);

    return resolveCrossFileConstant(this, this.context, css).then((result) => {
      debugLog("css-resolved", result, this.resourcePath);
      return callback(null, result, sourceMap);
    }, callback);
  });
}
