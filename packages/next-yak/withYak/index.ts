/// <reference types="node" />
import { existsSync } from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { NextConfig } from "../../example/node_modules/next/dist/server/config.js";

const currentDir =
  typeof __dirname !== "undefined"
    ? __dirname
    : dirname(fileURLToPath(import.meta.url));

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
  experiments?: {
    debug?: WebpackDebugOptions | TurbopackDebugOptions;
    transpilationMode?: "CssModule" | "Css";
  };
};

type WebpackDebugOptions =
  | boolean
  | {
      filter?: (path: string) => boolean;
      type: "all" | "ts" | "css" | "css resolved";
    };

type TurbopackDebugOptions = boolean;

const addYak = (yakOptions: YakConfigOptions, nextConfig: NextConfig) => {
  const isTurbo =
    process.env.TURBOPACK === "1" || process.env.TURBOPACK === "auto";
  const previousConfig = nextConfig.webpack;
  const minify =
    yakOptions.minify !== undefined
      ? yakOptions.minify
      : process.env.NODE_ENV === "production";
  const yakPluginOptions = {
    minify,
    basePath: currentDir,
    prefix: yakOptions.prefix,
    displayNames: yakOptions.displayNames ?? !minify,
    importMode: isTurbo
      ? { type: "DataUrl" }
      : {
          type: "InlineMatchResource",
          transpilation:
            yakOptions.experiments?.transpilationMode ?? "CssModule",
        },
  };

  if (isTurbo && typeof yakOptions.experiments?.debug === "object") {
    throw new Error(
      "The debug option must be a boolean when used with Turbopack",
    );
  }

  if (!isTurbo) {
    nextConfig.experimental ||= {};
    nextConfig.experimental.swcPlugins ||= [];
    nextConfig.experimental.swcPlugins.push(["yak-swc", yakPluginOptions]);
  } else {
    // Turbopack can't handle options with undefined values
    if (yakOptions.prefix === undefined) {
      delete yakPluginOptions.prefix;
      delete yakOptions.prefix;
    }

    nextConfig.turbopack ||= {};
    nextConfig.turbopack.rules ||= {};

    const ruleKey = "*.{js,jsx,cjs,mjs,ts,tsx,cts,mts}";
    const existingRule = nextConfig.turbopack.rules[ruleKey];

    const yakLoader = {
      loader: path.join(currentDir, "../loaders/turbo-loader.js"),
      options: {
        yakOptions,
        yakPluginOptions,
      },
    };

    if (existingRule && "loaders" in existingRule) {
      existingRule.loaders ||= [];
      // @ts-expect-error - We throw an error if the debug option isn't serializable
      existingRule.loaders.push(yakLoader);
    } else if (existingRule) {
      nextConfig.turbopack.rules[ruleKey] = {
        ...existingRule,
        // @ts-expect-error - We throw an error if the debug option isn't serializable
        loaders: [yakLoader],
      };
    } else {
      nextConfig.turbopack.rules[ruleKey] = {
        // @ts-expect-error - We throw an error if the debug option isn't serializable
        loaders: [yakLoader],
      };
    }
  }

  nextConfig.webpack = (webpackConfig, options) => {
    if (previousConfig) {
      webpackConfig = previousConfig(webpackConfig, options);
    }

    webpackConfig.module.rules.push({
      test:
        yakOptions.experiments?.transpilationMode === "Css"
          ? /\.yak\.css$/
          : /\.yak\.module\.css$/,
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
