import { relative } from "path";
import type { LoaderContext } from "webpack";
import type { YakConfigOptions } from "../withYak/index.js";
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
    const debugLog = createDebugLogger(this, experiments?.debug);

    debugLog("ts", source);
    const css = extractCss(source);
    debugLog("css", css);

    return resolveCrossFileConstant(this, this.context, css).then((result) => {
      debugLog("css resolved", css);
      return callback(null, result, sourceMap);
    }, callback);
  });
}

function extractCss(code: string | Buffer<ArrayBufferLike>): string {
  let codeString: string;

  if (typeof code === "string") {
    codeString = code;
  } else if (code instanceof Buffer) {
    codeString = code.toString("utf-8");
  } else if (code instanceof ArrayBuffer) {
    codeString = new TextDecoder("utf-8").decode(code);
  } else {
    throw new Error(
      "Invalid input type: code must be string, Buffer, or ArrayBuffer",
    );
  }

  const codeParts = codeString.split("/*YAK Extracted CSS:\n");
  let result = "";
  for (let i = 1; i < codeParts.length; i++) {
    const codeUntilEnd = codeParts[i].split("*/")[0];
    result += codeUntilEnd;
  }
  if (result) {
    result = "/* cssmodules-pure-no-check */\n" + result;
  }

  return result;
}

function createDebugLogger(
  loaderContext: LoaderContext<YakConfigOptions>,
  debugOptions: Required<YakConfigOptions>["experiments"]["debug"],
) {
  if (
    !debugOptions ||
    (debugOptions !== true &&
      debugOptions.filter &&
      !debugOptions.filter(loaderContext.resourcePath))
  ) {
    return () => {};
  }
  const debugType = debugOptions === true ? "ts" : debugOptions.type;
  return (
    messageType: "ts" | "css" | "css resolved",
    message: string | Buffer<ArrayBufferLike> | undefined,
  ) => {
    if (messageType === debugType || debugType === "all") {
      console.log(
        "🐮 Yak",
        messageType,
        "\n",
        loaderContext._compiler
          ? relative(
              loaderContext._compiler.context,
              loaderContext.resourcePath,
            )
          : loaderContext.resourcePath,
        "\n\n",
        message,
      );
    }
  };
}
