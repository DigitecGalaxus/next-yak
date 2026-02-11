import { Options, transform as swcTransform } from "@swc/core";
import {
  createEvaluator,
  type Evaluator,
} from "../isolated-source-eval/index.js";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, relative, resolve } from "node:path";
import { type Plugin } from "vite";
import { parseModule } from "../cross-file-resolver/parseModule.js";
import { resolveCrossFileConstant } from "../cross-file-resolver/resolveCrossFileConstant.js";
import { resolveYakContext, YakConfigOptions } from "../withYak/index.js";
import { createDebugLogger } from "./lib/debugLogger.js";
import { extractCss } from "./lib/extractCss.js";
import { parseExports } from "./lib/resolveCrossFileSelectors.js";
const require = createRequire(import.meta.url);

type ViteYakPluginOptions = YakConfigOptions & {
  swcOptions?: Omit<
    Options,
    | "filename"
    | "sourceFileName"
    | "inputSourceMap"
    | "sourceMaps"
    | "sourceRoot"
  >;
};

const defaultSwcOptions: ViteYakPluginOptions["swcOptions"] = {
  jsc: {
    parser: {
      syntax: "typescript",
      tsx: true,
      decorators: false,
      dynamicImport: true,
    },
    transform: {
      react: {
        runtime: "preserve",
      },
    },
    target: "es2022",
    loose: false,
    minify: {
      compress: false,
      mangle: false,
    },
    preserveAllComments: true,
  },
  minify: false,
  isModule: true,
};

export async function viteYak(
  userOptions: ViteYakPluginOptions = {},
): Promise<Plugin> {
  const yakOptions: ViteYakPluginOptions = {
    experiments: {
      transpilationMode: "Css",
      suppressDeprecationWarnings: false,
      ...userOptions.experiments,
    },
    minify: userOptions.minify ?? process.env.NODE_ENV === "production",
    prefix: userOptions.prefix,
    contextPath: userOptions.contextPath,
    swcOptions: deepMerge(defaultSwcOptions!, userOptions.swcOptions ?? {}),
  };
  yakOptions.displayNames =
    userOptions.displayNames ?? yakOptions.displayNames ?? !yakOptions.minify;
  let root = process.cwd();
  const debugLog = createDebugLogger(yakOptions.experiments?.debug, root);
  const sourceFileRegex = /\.(tsx?|m?jsx?)\??/;
  const virtualModuleRegex = /^virtual:yak-css:/;
  const virtualCssModuleRegex = /^\0virtual:yak-css:/;
  const yakSwcPath = await findYakSwcPlugin();
  const evaluator: Evaluator = await createEvaluator();
  return {
    name: "vite-plugin-yak:css:pre",
    enforce: "pre",
    config: (config) => {
      const context = resolveYakContext(
        yakOptions.contextPath,
        config.root ?? root,
      );

      if (!context) {
        return;
      }

      config.resolve ||= {};

      if (Array.isArray(config.resolve.alias)) {
        config.resolve.alias.push({
          find: "next-yak/context/baseContext",
          replacement: context,
        });
      } else {
        config.resolve.alias = {
          ...config.resolve.alias,
          "next-yak/context/baseContext": context,
        };
      }
    },
    configResolved(config) {
      root = config.root;
    },
    resolveId: {
      filter: {
        id: virtualModuleRegex,
      },
      handler(id) {
        return "\0" + id;
      },
    },
    load: {
      filter: {
        id: virtualCssModuleRegex,
      },
      async handler(id) {
        // remove \0virtual:yak-css: (17 chars) from the beginning and .css (4 chars) from the end
        const originalId = id.slice(17, -4);
        this.addWatchFile(originalId);

        const sourceContent = await this.fs.readFile(originalId, {
          encoding: "utf8",
        });
        const code = await transform(
          sourceContent,
          originalId,
          root,
          yakSwcPath,
          yakOptions,
        );
        const extractedCss = extractCss(code.code, "Css");
        debugLog("css", extractedCss, originalId);

        const { resolved } = await resolveCrossFileConstant(
          {
            parse: (modulePath) => {
              return parseModule(
                {
                  transpilationMode: "Css",
                  extractExports: async (modulePath) => {
                    const sourceContent = await this.fs.readFile(modulePath, {
                      encoding: "utf8",
                    });

                    this.addWatchFile(modulePath);

                    return parseExports(sourceContent);
                  },
                  getTransformed: async (modulePath) => {
                    const sourceContent = await this.fs.readFile(modulePath, {
                      encoding: "utf8",
                    });
                    return transform(
                      sourceContent,
                      modulePath,
                      root,
                      yakSwcPath,
                      yakOptions,
                    );
                  },
                  evaluateYakModule: async (modulePath: string) => {
                    this.addWatchFile(modulePath);
                    const result = await evaluator.evaluate(modulePath);
                    if (!result.ok) {
                      throw new Error(result.error.message);
                    }
                    for (const dep of result.dependencies) {
                      this.addWatchFile(dep);
                    }
                    return result.value;
                  },
                },
                modulePath,
              );
            },
            resolve: async (moduleSpecifier: string, context: string) => {
              let importer = context;
              const resolved = await this.resolve(moduleSpecifier, importer);

              if (!resolved) {
                throw new Error(
                  `Could not resolve ${moduleSpecifier} from ${context}`,
                );
              }
              return resolved.id;
            },
          },
          originalId,
          extractedCss,
        );

        debugLog("css-resolved", resolved, originalId);
        return resolved;
      },
    },

    configureServer(server) {
      server.watcher.on("change", (file) => {
        evaluator.invalidate(file);
      });
    },

    async buildEnd() {
      await evaluator.dispose();
    },

    transform: {
      filter: {
        id: {
          include: sourceFileRegex,
          exclude: [/packages\/next-yak/],
        },
        code: "next-yak",
      },
      async handler(code, id) {
        try {
          const result = await transform(
            code,
            id.split("?")[0],
            root,
            yakSwcPath,
            yakOptions,
          );
          debugLog("ts", result.code, id);

          return {
            code: result.code,
            map: result.map,
          };
        } catch (error) {
          this.error(
            `[YAK Plugin] Error transforming ${id}: ${(error as Error).message}`,
          );
        }
      },
    },

    // Vite's default HMR only updates the JS module when a source file changes.
    // The extracted CSS lives in a separate virtual module (virtual:yak-css:...)
    // which Vite doesn't know is derived from the source file. Without explicit
    // invalidation here, the browser keeps stale CSS after edits.
    hotUpdate({ modules, file, type }) {
      if (type !== "update" && type !== "create") return;
      if (!sourceFileRegex.test(file)) return;

      // The SWC plugin generates virtual module paths relative to root
      // (via {{__MODULE_PATH__}}), so we must match that format.
      const relativePath = relative(root, file);
      const virtualId = "\0virtual:yak-css:" + relativePath + ".css";
      const mod = this.environment.moduleGraph.getModuleById(virtualId);
      if (mod) {
        this.environment.moduleGraph.invalidateModule(mod);
        return [...modules, mod];
      }
    },
  };
}

/**
 * This function finds the path to the yak-swc plugin because it is most of the time a transitive dependency
 * and the resolver of SWC only resolves the main node_modules directory.
 * @returns The path to the yak-swc wasm plugin.
 */
async function findYakSwcPlugin() {
  try {
    const packageJsonPath = require.resolve("yak-swc/package.json");
    const packageRoot = dirname(packageJsonPath);

    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

    // Resolve the main field which points to the WASM file
    const wasmPath = resolve(packageRoot, packageJson.main);

    return wasmPath;
  } catch (e) {
    throw new Error(`Could not resolve yak-swc plugin: ${e}`);
  }
}

function transform(
  data: string,
  modulePath: string,
  rootPath: string,
  yakSwcPath: string,
  yakOptions: ViteYakPluginOptions,
) {
  // https://github.com/vercel/next.js/blob/canary/packages/next/src/build/webpack/loaders/next-swc-loader.ts#L143
  return swcTransform(data, {
    filename: modulePath,
    inputSourceMap: undefined,
    sourceMaps: true,
    sourceFileName: modulePath,
    sourceRoot: rootPath,
    ...yakOptions.swcOptions,
    jsc: {
      ...yakOptions.swcOptions?.jsc,
      experimental: {
        plugins: [
          [
            yakSwcPath,
            {
              minify: yakOptions.minify,
              basePath: rootPath,
              prefix: yakOptions.prefix,
              displayNames: yakOptions.displayNames,
              suppressDeprecationWarnings:
                yakOptions.experiments?.suppressDeprecationWarnings,
              importMode: {
                value: "virtual:yak-css:{{__MODULE_PATH__}}.css",
                transpilation: "Css",
                encoding: "None",
              },
            },
          ],
        ],
      },
    },
  });
}

/**
 * Deep merge two objects, with source values overriding target values.
 */
function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T {
  const result = { ...target };
  for (const key of Object.keys(source) as Array<keyof T>) {
    const sourceValue = source[key];
    const targetValue = target[key];
    if (
      sourceValue !== undefined &&
      typeof sourceValue === "object" &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === "object" &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
      ) as T[keyof T];
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[keyof T];
    }
  }
  return result;
}
