import { relative } from "path";
import type { LoaderContext } from "webpack";
import type { YakConfigOptions } from "../../withYak/index.js";

/**
 * Creates a debug logger function that conditionally logs messages
 * based on debug options and file paths.
 */
export function createDebugLogger(
  loaderContext: LoaderContext<unknown>,
  debugOptions: Required<YakConfigOptions>["experiments"]["debug"],
) {
  if (!debugOptions) {
    return () => {};
  }
  const currentPath = loaderContext._compiler
    ? relative(loaderContext._compiler.context, loaderContext.resourcePath)
    : loaderContext.resourcePath;
  return (
    messageType: "ts" | "css" | "css-resolved",
    message: string | Buffer<ArrayBufferLike> | undefined,
  ) => {
    // the path contains already the extension for the ts{x} file
    const pathWithExtension =
      messageType !== "ts" ? currentPath + `.${messageType}` : currentPath;
    if (
      debugOptions === true ||
      new RegExp(debugOptions).test(pathWithExtension)
    ) {
      console.log("🐮 Yak", pathWithExtension, "\n\n", message);
    }
  };
}
