import { transform as swcTransform } from "@swc/core";
import { dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createContext, runInContext } from "node:vm";
import { type Plugin } from "vite";
import { parseModule } from "../cross-file-resolver/parseModule.js";
import { resolveCrossFileConstant } from "../cross-file-resolver/resolveCrossFileConstant.js";
import { resolveYakContext, YakConfigOptions } from "../withYak/index.js";
import { extractCss } from "./lib/extractCss.js";
import { parseExports } from "./lib/resolveCrossFileSelectors.js";

const currentDir =
  typeof __dirname !== "undefined"
    ? __dirname
    : dirname(fileURLToPath(import.meta.url));

export function viteYak(
  yakOptions: YakConfigOptions = {
    experiments: {
      transpilationMode: "Css",
    },
    minify: process.env.NODE_ENV === "production",
  },
): Plugin {
  yakOptions.displayNames = yakOptions.displayNames ?? !yakOptions.minify;
  let root = process.cwd();
  const debugLog = createDebugLogger(yakOptions.experiments?.debug, root);
  const sourceFileRegex = /\.(tsx?|m?jsx?)$/;
  const virtualModuleRegex = /^virtual:yak-css:/;
  const virtualCssModuleRegex = /^\0virtual:yak-css:/;
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
                      yakOptions,
                    );
                  },
                  evaluateYakModule: async (modulePath: string) => {
                    this.addWatchFile(modulePath);
                    const sourceContent = await this.fs.readFile(modulePath, {
                      encoding: "utf8",
                    });

                    const transformed = await swcTransform(sourceContent, {
                      filename: modulePath,
                      sourceFileName: modulePath,
                      jsc: {
                        transform: {
                          react: { runtime: "automatic" },
                        },
                        experimental: {
                          plugins: [
                            [
                              "yak-swc",
                              {
                                minify: yakOptions.minify,
                                basePath: root,
                                prefix: yakOptions.prefix,
                                displayNames: yakOptions.displayNames,
                                importMode: {
                                  type: "Custom",
                                  value: `virtual:yak-css:${modulePath}.css`,
                                  transpilation: "Css",
                                  encoding: "None",
                                },
                              },
                            ],
                          ],
                        },
                      },
                      module: {
                        type: "commonjs",
                      },
                    });

                    const moduleObject = { exports: {} };
                    const context = createContext({
                      require: (path: string) => {
                        throw new Error(
                          `Yak files cannot have imports in turbopack.\n` +
                            `Found require/import usage in: ${modulePath} to import: ${path}.\n` +
                            `Yak files should be self-contained and only export constants or styled components.\n` +
                            `This will be resolved once Vercel adds "this.importModule" support for turbopack.`,
                        );
                      },
                      __filename: modulePath,
                      __dirname: dirname(modulePath),
                      global: {},
                      console,
                      Buffer,
                      process,
                      setTimeout,
                      clearTimeout,
                      setInterval,
                      clearInterval,
                      setImmediate,
                      clearImmediate,
                      exports: moduleObject.exports,
                      module: moduleObject,
                    });
                    runInContext(transformed.code, context);

                    return moduleObject.exports;
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

    transform: {
      filter: {
        id: sourceFileRegex,
        code: "next-yak",
      },
      async handler(code, id) {
        try {
          const result = await transform(code, id, root, yakOptions);
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
  };
}

function transform(
  data: string,
  modulePath: string,
  rootPath: string,
  yakOptions: YakConfigOptions,
) {
  // https://github.com/vercel/next.js/blob/canary/packages/next/src/build/webpack/loaders/next-swc-loader.ts#L143
  return swcTransform(data, {
    filename: modulePath,
    inputSourceMap: undefined,
    sourceMaps: true,
    sourceFileName: modulePath,
    sourceRoot: rootPath,
    jsc: {
      experimental: {
        plugins: [
          [
            "yak-swc",
            {
              minify: yakOptions.minify,
              basePath: rootPath,
              prefix: yakOptions.prefix,
              displayNames: yakOptions.displayNames,
              importMode: {
                type: "Custom",
                value: `virtual:yak-css:${modulePath}.css`,
                transpilation: "Css",
                encoding: "None",
              },
            },
          ],
        ],
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
  });
}

/**
 * Creates a debug logger function that conditionally logs messages
 * based on debug options and file paths.
 */
export function createDebugLogger(
  debugOptions: Required<YakConfigOptions>["experiments"]["debug"],
  root: string,
) {
  if (!debugOptions) {
    return () => {};
  }

  return (
    messageType: "ts" | "css" | "css-resolved",
    message: string | Buffer<ArrayBufferLike> | undefined,
    filePath: string,
  ) => {
    // the path contains already the extension for the ts{x} file
    const pathWithExtension =
      messageType !== "ts" ? filePath + `.${messageType}` : filePath;
    if (
      debugOptions === true ||
      new RegExp(debugOptions).test(pathWithExtension)
    ) {
      console.log("🐮 Yak", relative(root, pathWithExtension), "\n\n", message);
    }
  };
}
