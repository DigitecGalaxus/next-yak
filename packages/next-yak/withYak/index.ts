/// <reference types="node" />
import type { NextConfig } from "next";
import { existsSync } from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

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
    /**
     * A regex pattern to filter files based on their path.
     * Use ".css$" to filter the raw CSS transpilation and ".css-resolved$" for resolved CSS
     * Use true to enable debug mode for all files
     */
    debug?: boolean | string;
    transpilationMode?: "CssModule" | "Css";
  };
};

const addYak = (yakOptions: YakConfigOptions, nextConfig: NextConfig) => {
  const minify = yakOptions.minify ?? process.env.NODE_ENV === "production";
  const yakPluginOptions = {
    minify,
    basePath: currentDir,
    prefix: yakOptions.prefix,
    displayNames: yakOptions.displayNames ?? !minify,
  };

  if (process.env.TURBOPACK === "1" || process.env.TURBOPACK === "auto") {
    addYakTurbopack(nextConfig, yakOptions, {
      ...yakPluginOptions,
      importMode: { type: "DataUrl" },
    });
  } else {
    addYakWebpack(nextConfig, yakOptions, {
      ...yakPluginOptions,
      importMode: {
        type: "InlineMatchResource",
        transpilation: yakOptions.experiments?.transpilationMode ?? "CssModule",
      },
    });
  }
  return nextConfig;
};

/**
 * Configure Turbopack with yak loader for CSS-in-JS transformation
 * @param nextConfig - Next.js configuration object
 * @param yakOptions - Yak configuration options
 * @param yakPluginOptions - Processed plugin options for yak-swc
 */
function addYakTurbopack(
  nextConfig: NextConfig,
  yakOptions: YakConfigOptions,
  yakPluginOptions: {
    minify: boolean;
    basePath: string;
    prefix?: string;
    displayNames: boolean;
    importMode: { type: string };
  },
) {
  // turbopack can't handle options with undefined values, so we remove them
  const yakLoader = removeUndefinedRecursive({
    loader: path.join(currentDir, "../loaders/turbo-loader.cjs"),
    options: {
      yakOptions: yakOptions,
      yakPluginOptions: yakPluginOptions,
    },
  }) as { loader: string; options: {} };

  nextConfig.turbopack ||= {};
  nextConfig.turbopack.rules ||= {};

  const ruleKey = "*.{js,jsx,cjs,mjs,ts,tsx,cts,mts}";
  nextConfig.turbopack.rules[ruleKey] = {
    loaders: [],
    ...nextConfig.turbopack.rules[ruleKey],
  };
  nextConfig.turbopack.rules[ruleKey].loaders.push(yakLoader);

  // Configure resolveAlias for custom yak context (similar to webpack)
  // This allows users to provide a custom context file that will be used
  // instead of the default baseContext
  const yakContext = resolveYakContext(yakOptions.contextPath, process.cwd());
  if (yakContext) {
    nextConfig.turbopack.resolveAlias ||= {};
    nextConfig.turbopack.resolveAlias["next-yak/context/baseContext"] =
      // This is a hack around the fact that turbopack currently only supports relative paths
      // turbopack: "server relative imports are not implemented yet"
      // Relative is quite dangerous here as it relies on the cwd being the starting point
      `./${path.relative(process.cwd(), yakContext)}`;
  }
}

/**
 * Configure Webpack with yak SWC plugin and webpack loader for CSS-in-JS transformation
 * @param nextConfig - Next.js configuration object
 * @param yakOptions - Yak configuration options
 * @param yakPluginOptions - Processed plugin options for yak-swc
 */
function addYakWebpack(
  nextConfig: NextConfig,
  yakOptions: YakConfigOptions,
  yakPluginOptions: {
    minify: boolean;
    basePath: string;
    prefix?: string;
    displayNames: boolean;
    importMode: { type: string; transpilation?: string };
  },
) {
  // Add SWC plugin for Webpack
  nextConfig.experimental ||= {};
  nextConfig.experimental.swcPlugins ||= [];
  nextConfig.experimental.swcPlugins.push(["yak-swc", yakPluginOptions]);

  // Configure webpack loader
  const previousConfig = nextConfig.webpack;
  nextConfig.webpack = (webpackConfig, options) => {
    if (previousConfig) {
      webpackConfig = previousConfig(webpackConfig, options);
    }

    webpackConfig.module.rules.push({
      test:
        yakOptions.experiments?.transpilationMode === "Css"
          ? /\.yak\.css$/
          : /\.yak\.module\.css$/,
      loader: path.join(currentDir, "../loaders/webpack-loader.cjs"),
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
}

/**
 * Recursively removes undefined values from an object or array.
 *
 * This function deeply traverses the input object/array and creates a new structure
 * with all undefined values filtered out. For objects, properties with undefined values
 * are omitted. For arrays, undefined elements are removed from the result.
 *
 * @param obj - The object or array to process
 * @returns A new object/array with undefined values removed, or the original value if no changes were needed
 */
function removeUndefinedRecursive<T>(obj: T): {} {
  if (typeof obj !== "object" || obj === null) {
    return obj as {};
  }

  if (Array.isArray(obj)) {
    const filtered: unknown[] = [];
    for (let i = 0; i < obj.length; i++) {
      const processed = removeUndefinedRecursive(obj[i]);
      if (processed !== undefined) {
        filtered.push(processed);
      }
    }
    return filtered as {};
  }

  const newObj: Record<string, unknown> = {};
  let hasChanges = false;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = removeUndefinedRecursive((obj as any)[key]);
      if (value !== undefined) {
        newObj[key] = value;
        hasChanges = true;
      }
    }
  }

  return hasChanges ? (newObj as {}) : obj;
}

/**
 * Try to resolve yak
 */
export function resolveYakContext(
  contextPath: string | undefined,
  cwd: string,
) {
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
