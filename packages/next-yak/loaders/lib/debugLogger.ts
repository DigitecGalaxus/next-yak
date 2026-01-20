import { relative } from "path";
import type { YakConfigOptions } from "../../withYak/index.js";

type DebugOptions = Required<YakConfigOptions>["experiments"]["debug"];
type DebugType = NonNullable<
  Exclude<DebugOptions, true | undefined>
>["types"] extends Array<infer T> | undefined
  ? T
  : never;

/**
 * Creates a debug logger function that conditionally logs messages
 * based on debug options and file paths.
 */
export function createDebugLogger(
  debugOptions: DebugOptions | undefined,
  rootPath: string,
) {
  if (!debugOptions) {
    return () => {};
  }

  // Handle true (log all) vs object (with optional filtering)
  const pattern = debugOptions === true ? undefined : debugOptions.pattern;
  const typesArray = debugOptions === true ? undefined : debugOptions.types;

  // Validate and pre-compile regex pattern
  let compiledPattern: RegExp | null = null;
  if (pattern) {
    try {
      compiledPattern = new RegExp(pattern);
    } catch (error) {
      throw new Error(
        `Invalid debug pattern: "${pattern}" is not a valid regular expression. ${
          error instanceof Error ? error.message : ""
        }`,
      );
    }
  }

  const types = typesArray ? new Set(typesArray) : null;

  return (
    messageType: DebugType,
    message: string | Buffer<ArrayBufferLike> | undefined,
    filePath: string,
  ) => {
    // Filter by type if specified
    if (types && !types.has(messageType)) {
      return;
    }

    const relativePath = relative(rootPath, filePath);

    // Filter by pattern if specified, or log all if no pattern
    if (!compiledPattern || compiledPattern.test(relativePath)) {
      console.log("🐮 Yak", `[${messageType}]`, relativePath, "\n\n", message);
    }
  };
}
