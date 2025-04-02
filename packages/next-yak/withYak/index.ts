/// <reference types="node" />
import { NextConfig } from "../../example/node_modules/next/dist/server/config.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { dirname } from "node:path";
import { createRequire } from "module";

const currentDir =
  typeof __dirname !== "undefined"
    ? __dirname
    : dirname(fileURLToPath(import.meta.url));

const { resolve } = createRequire(currentDir + "/index.js");

export type YakConfigOptions = {
  contextPath?: string;
  /**
   * Optional prefix for generated CSS identifiers.
   * This can be used to ensure unique class names across different applications
   * or to add organization-specific prefixes.
   */
  prefix?: string;
  /**
   * Adds `displayName` to each components for better React DevTools debugging
   * - Enabled by default in development mode
   * - Disabled by default in production
   * - Increases bundle size slightly when enabled
   */
  displayNames?: boolean;
  experiments?: {
    debug?:
      | boolean
      | {
          filter?: (path: string) => boolean;
          type: "all" | "ts" | "css" | "css resolved";
        };
  };
};

const addYak = (yakOptions: YakConfigOptions, nextConfig: NextConfig) => {
  const previousConfig = nextConfig.webpack;
  const devMode = process.env.NODE_ENV !== "production";

  nextConfig.experimental ||= {};
  nextConfig.experimental.swcPlugins ||= [];
  nextConfig.experimental.swcPlugins.push([
    resolve("yak-swc"),
    {
      devMode,
      basePath: currentDir,
      prefix: yakOptions.prefix,
      displayNames: yakOptions.displayNames ?? devMode,
    },
  ]);

  nextConfig.webpack = (webpackConfig, options) => {
    if (previousConfig) {
      webpackConfig = previousConfig(webpackConfig, options);
    }

    webpackConfig.module.rules.push({
      test: /\.yak\.module\.css$/,
      loader: path.join(currentDir, "../loaders/css-loader.js"),
      options: yakOptions,
    });

    // With the following alias the internal next-yak code
    // is able to import a context which works for server components
    const yakContext = resolveYakContext(
      yakOptions.contextPath,
      webpackConfig.context || process.cwd(),
    );
    if (yakContext) {
      webpackConfig.resolve.alias["next-yak/context/baseContext"] = yakContext;
    }

    return webpackConfig;
  };
  return nextConfig;
};

/**
 * Try to resolve yak
 */
function resolveYakContext(contextPath: string | undefined, cwd: string) {
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

// Wrapper to allow sync, async, and function configuration of Next.js
/**
 * Add Yak to your Next.js app
 *
 * @usage
 *
 * ```ts
 * // next.config.js
 * const { withYak } = require("next-yak/withYak");
 * const nextConfig = {
 *   // your next config here
 * };
 * module.exports = withYak(nextConfig);
 * ```
 *
 * With a custom yakConfig
 *
 * ```ts
 * // next.config.js
 * const { withYak } = require("next-yak/withYak");
 * const nextConfig = {
 *   // your next config here
 * };
 * const yakConfig = {
 *   // Optional prefix for generated CSS identifiers
 *   prefix: "my-app",
 *   // Other yak config options...
 * };
 * module.exports = withYak(yakConfig, nextConfig);
 * ```
 */
export const withYak: {
  <
    T extends
      | Record<string, any>
      | ((...args: any[]) => Record<string, any>)
      | ((...args: any[]) => Promise<Record<string, any>>),
  >(
    yakOptions: YakConfigOptions,
    nextConfig: T,
  ): T;
  // no yakConfig
  <
    T extends
      | Record<string, any>
      | ((...args: any[]) => Record<string, any>)
      | ((...args: any[]) => Promise<Record<string, any>>),
  >(
    nextConfig: T,
    _?: undefined,
  ): T;
} = (maybeYakOptions, nextConfig) => {
  if (nextConfig === undefined) {
    return withYak({}, maybeYakOptions);
  }
  // If the second parameter is present the first parameter must be a YakConfigOptions
  const yakOptions = maybeYakOptions as YakConfigOptions;
  if (typeof nextConfig === "function") {
    /**
     * A NextConfig can be a sync or async function
     * https://nextjs.org/docs/pages/api-reference/next-config-js
     * @param {any[]} args
     */
    return (...args) => {
      /** Dynamic Next Configs can be async or sync */
      const config = nextConfig(...args) as NextConfig | Promise<NextConfig>;
      return config instanceof Promise
        ? config.then((config) => addYak(yakOptions, config))
        : addYak(yakOptions, config);
    };
  }
  return addYak(yakOptions, nextConfig);
};
