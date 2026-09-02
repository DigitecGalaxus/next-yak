/// <reference types="node" />
import type { NextConfig } from "next";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildYakPluginOptions,
  resolveYakContext,
  type YakConfigOptions,
} from "yak-internals/config";

export { buildYakPluginOptions, resolveYakContext } from "yak-internals/config";
export type { YakConfigOptions } from "yak-internals/config";

const currentDir =
  typeof __dirname !== "undefined" ? __dirname : dirname(fileURLToPath(import.meta.url));

const addYak = (yakOptions: YakConfigOptions, nextConfig: NextConfig) => {
  const yakPluginOptions = buildYakPluginOptions(yakOptions, currentDir);

  const transpilation = yakOptions.experiments?.transpilationMode ?? "CssModule";
  const cssExtension = transpilation === "CssModule" ? ".yak.module.css" : ".yak.css";

  if (process.env.TURBOPACK === "1" || process.env.TURBOPACK === "auto") {
    addYakTurbopack(nextConfig, yakOptions, {
      ...yakPluginOptions,
      importMode: {
        value: "data:text/css;base64,",
        transpilation: "Css",
        encoding: "Base64",
      },
    });
  } else {
    addYakWebpack(nextConfig, yakOptions, {
      ...yakPluginOptions,
      importMode: {
        value: `./{{__BASE_NAME__}}${cssExtension}!=!./{{__BASE_NAME__}}?./{{__BASE_NAME__}}${cssExtension}`,
        transpilation,
        encoding: "None",
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
    foldStatic: boolean;
    strictCssProp: boolean;
    importMode: {
      value: string;
      transpilation: string;
      encoding: string;
    };
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
  const rule = {
    loaders: [] as { loader: string; options: {} }[],
    ...nextConfig.turbopack.rules[ruleKey],
  };
  rule.loaders.push(yakLoader);
  nextConfig.turbopack.rules[ruleKey] = rule;

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
    foldStatic: boolean;
    strictCssProp: boolean;
    importMode: {
      value: string;
      transpilation: string;
      encoding: string;
    };
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
        yakOptions.experiments?.transpilationMode === "Css" ? /\.yak\.css$/ : /\.yak\.module\.css$/,
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
