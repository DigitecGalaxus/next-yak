/// <reference types="node" />
import { existsSync } from "node:fs";
import path from "node:path";

export type YakConfigOptions = {
  /**
   * Generate compact CSS class and variable names.
   * @defaultValue
   * enabled if NODE_ENV is set to `production`, otherwise disabled
   */
  minify?: boolean;
  contextPath?: string;
  /**
   * Optional prefix for generated CSS identifiers.
   * This can be used to ensure unique class names across different applications
   * or to add organization-specific prefixes.
   */
  prefix?: string;
  /**
   * Adds `displayName` to each component for better React DevTools debugging
   * - Enabled by default in development mode
   * - Disabled by default in production
   * - Increases bundle size slightly when enabled
   */
  displayNames?: boolean;
  /**
   * Fold statically known styles at build time: JSX usages of fully static
   * styled components become plain DOM elements, and a static `css` prop
   * becomes a plain `className`. Both skip the runtime wrapper and merge calls.
   * @defaultValue true
   */
  foldStatic?: boolean;
  /**
   * Fail the build when a `css` prop has a value next-yak can't handle
   * (e.g. an array, an object or a plain string). next-yak claims the `css`
   * prop, so a malformed value is almost always a mistake worth surfacing.
   *
   * Set to `false` to leave such props untouched instead, e.g. when another
   * library on the same element uses its own `css` prop.
   * @defaultValue true
   */
  strictCssProp?: boolean;
  experiments?: {
    /**
     * Debug logging for transformed files.
     * - `true` - log all files
     * - `object` - filter by pattern and/or output types (at least one required)
     */
    debug?:
      | true
      | { pattern: string; types?: Array<"ts" | "css" | "css-resolved"> }
      | { pattern?: string; types: Array<"ts" | "css" | "css-resolved"> };
    transpilationMode?: "CssModule" | "Css";
    /**
     * Suppress deprecation warnings for :global() selectors during migration period
     * @defaultValue false
     */
    suppressDeprecationWarnings?: boolean;
  };
};

/**
 * Build the base yak-swc plugin options shared by every bundler integration
 * (webpack, turbopack, vite, rsbuild). The caller adds the bundler-specific
 * `importMode` on top.
 *
 * @param yakOptions - Yak configuration options
 * @param basePath - Base path used by yak-swc to derive stable identifiers
 */
export function buildYakPluginOptions(yakOptions: YakConfigOptions, basePath: string) {
  const minify = yakOptions.minify ?? process.env.NODE_ENV === "production";
  return {
    minify,
    basePath,
    prefix: yakOptions.prefix,
    displayNames: yakOptions.displayNames ?? !minify,
    foldStatic: yakOptions.foldStatic ?? true,
    strictCssProp: yakOptions.strictCssProp ?? true,
    suppressDeprecationWarnings: yakOptions.experiments?.suppressDeprecationWarnings ?? false,
    reactRefreshReg: true,
  };
}

/**
 * Try to resolve yak
 */
export function resolveYakContext(contextPath: string | undefined, cwd: string) {
  const yakContext = contextPath
    ? path.resolve(cwd, contextPath)
    : path.resolve(cwd, "yak.context");
  const extensions = ["", ".ts", ".tsx", ".js", ".jsx"];
  for (const extension in extensions) {
    const fileName = yakContext + extensions[extension];
    if (existsSync(fileName)) {
      return fileName;
    }
  }
  if (contextPath) {
    throw new Error(`Could not find yak context file at ${yakContext}`);
  }
}
