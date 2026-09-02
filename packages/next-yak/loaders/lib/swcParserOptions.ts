import type { ParserConfig } from "@swc/core";

const typeScriptWithoutJsx = /\.[mc]?ts$/;
const typeScriptWithJsx = /\.tsx$/;

/**
 * Derive the SWC parser configuration for a single file.
 *
 * JSX is enabled everywhere except in `.ts`, `.mts` and `.cts`,
 * where angle brackets are type assertions and generics rather than elements.
 *
 * This is inspired by next.js own handling.
 */
export function getSwcParserOptions(filename: string): ParserConfig {
  // module ids may carry a query string (`/a/b.ts?v=1`)
  const [path] = filename.split("?");
  if (typeScriptWithoutJsx.test(path)) {
    return { syntax: "typescript", tsx: false, dynamicImport: true };
  }
  if (typeScriptWithJsx.test(path)) {
    return { syntax: "typescript", tsx: true, dynamicImport: true };
  }
  return { syntax: "ecmascript", jsx: true, dynamicImport: true };
}
