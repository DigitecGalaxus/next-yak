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

  throwOnDeprecatedDebugOptions(debugOptions);

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

/**
 * Detects deprecated debug option shapes and throws helpful migration errors.
 * TODO: Remove this function in the next major version.
 */
function throwOnDeprecatedDebugOptions(
  debugOptions: DebugOptions,
): void {
  // Old API: debug: "regex-string"
  if (typeof debugOptions === "string") {
    const suggestion = suggestTypesForExtensionPattern(debugOptions)
      ?? `debug: { pattern: "${debugOptions}" }`;
    throw new Error(
      `The debug option no longer accepts a string. Please update your config:\n` +
        `  Before: debug: "${debugOptions}"\n` +
        `  After:  ${suggestion}`,
    );
  }

  // Old API: debug: { filter: Function, type: string }
  if (typeof debugOptions === "object" && "filter" in debugOptions) {
    throw new Error(
      `The debug option no longer accepts { filter, type }. Please update your config:\n` +
        `  Before: debug: { filter: ..., type: "..." }\n` +
        `  After:  debug: { pattern: "...", types: ["ts", "css", "css-resolved"] }`,
    );
  }

  // Old convention: pattern used ".css$" or ".css-resolved$" as file extension
  // for type filtering — the pattern now only matches file paths
  if (typeof debugOptions === "object" && debugOptions.pattern) {
    const suggestion = suggestTypesForExtensionPattern(debugOptions.pattern);
    if (suggestion) {
      throw new Error(
        `The debug pattern "${debugOptions.pattern}" looks like it's filtering by output type using the old file extension convention.\n` +
          `The pattern now only matches file paths. Use the "types" option to filter by output type:\n` +
          `  Before: debug: { pattern: "${debugOptions.pattern}" }\n` +
          `  After:  ${suggestion}`,
      );
    }
  }
}

/**
 * Checks if a pattern string uses the old ".css$" / ".css-resolved$" file
 * extension convention for type filtering. Returns a suggested replacement
 * or null if the pattern doesn't match.
 */
function suggestTypesForExtensionPattern(pattern: string): string | null {
  const extensionMatch = pattern.match(
    /\.\(?(?:css-resolved|css)\)?\$?$/,
  );
  if (!extensionMatch) {
    return null;
  }
  const type = extensionMatch[0].includes("css-resolved")
    ? "css-resolved"
    : "css";
  const remaining = pattern.slice(0, extensionMatch.index);
  return remaining
    ? `debug: { pattern: "${remaining}", types: ["${type}"] }`
    : `debug: { types: ["${type}"] }`;
}
