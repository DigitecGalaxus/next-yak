import { transform as swcTransform } from "@swc/core";
import { dirname } from "node:path";
import { createContext, runInContext } from "node:vm";
import { type Plugin, type ViteDevServer } from "vite";
import { parseModule } from "../cross-file-resolver/parseModule.js";
import { resolveCrossFileConstant } from "../cross-file-resolver/resolveCrossFileConstant.js";
import { resolveYakContext } from "../withYak/index.js";
import { extractCss } from "./lib/extractCss.js";
import { parseExports } from "./lib/resolveCrossFileSelectors.js";

export function viteYak(): Plugin {
  let server: ViteDevServer;
  let mode: "dev" | "build" = "dev";
  let root = process.cwd();

  return {
    name: "vite-yak:css:pre",
    enforce: "pre",
    config: (config) => {
      const context = resolveYakContext(
        // todo add config possibility
        undefined,
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
    async configureServer(_server) {
      server = _server;
    },
    configResolved(config) {
      root = config.root;
      if (config.command === "build") {
        mode = "build";
      }
    },
    async resolveId(id) {
      if (id.startsWith("virtual:yak-css:")) {
        const virtualId = `\0${id}`;
        return virtualId;
      }
      return null;
    },

    async load(id) {
      console.log("load: ", id);
      if (id.startsWith("\0virtual:yak-css:")) {
        const originalId = id
          .replace("\0virtual:yak-css:", "")
          .replace(/\.css$/, "");

        // Add for HMR - this tells Vite to watch the original file
        this.addWatchFile(originalId);

        // const extractedCssBase64 = id
        //   .replace("\0virtual:yak-css:", "")
        //   .replace(/^.*\?inline&/, "");
        // const extractedCss = Buffer.from(extractedCssBase64, "base64").toString(
        //   "utf-8",
        // );

        const transform = createTransform({
          basePath: root,
          importMode: {
            type: "Custom",
            value: `virtual:yak-css:${id}.css`,
            transpilation: "Css",
            encoding: "None",
          },
        });

        const sourceContent = await this.fs.readFile(originalId, {
          encoding: "utf8",
        });
        const code = await transform(sourceContent, originalId, root);
        const extractedCss = extractCss(code.code, "Css");

        const resolveFn = async (moduleSpecifier: string, context: string) => {
          let importer = context;

          // These workarounds are necessary because webpacks resolution is more advanced
          // if (context.endsWith("/src")) {
          //   // add virtual file path that the import comes from
          //   importer = context + "/index.tsx";
          // } else if (!context.includes(".")) {
          //   // add a virtual extension to the path if it's not present
          //   importer = context + ".tsx"; // or '/package.json'
          // }

          console.log({ moduleSpecifier, context, importer });

          const resolved = await this.resolve(moduleSpecifier, importer);

          if (!resolved) {
            throw new Error(
              `Could not resolve ${moduleSpecifier} from ${context}`,
            );
          }
          return resolved.id;
        };

        const transformedCode = await resolveCrossFileConstant(
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
                    return transform(sourceContent, modulePath, root);
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
                                basePath: root,
                                importMode: {
                                  type: "Custom",
                                  value: `virtual:yak-css:${id}.css`,
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
            resolve: resolveFn,
          },
          originalId,
          extractedCss,
        );

        console.log({
          module: id,
          originalId,
          extractedCss,
          resolvedCSS: transformedCode.resolved,
        });

        // Return the CSS and mark with moduleSideEffects to prevent tree-shaking
        // This is critical for HMR to work correctly with virtual CSS modules
        return {
          code: transformedCode.resolved,
          map: { mappings: "" },
        };
      }

      return null;
    },

    async transform(code, id) {
      if (
        id.endsWith(".ts") ||
        id.endsWith(".tsx") ||
        id.endsWith(".js") ||
        id.endsWith(".jsx")
      ) {
        try {
          const transform = createTransform({
            basePath: root,
            importMode: {
              type: "Custom",
              value: `virtual:yak-css:${id}.css`,
              transpilation: "Css",
              encoding: "None",
            },
          });

          const result = await transform(code, id, root);

          return {
            code: result.code,
            map: result.map,
          };
        } catch (error) {
          this.error(
            `[YAK Plugin] Error transforming ${id}: ${(error as Error).message}`,
          );
        }
      }

      return null;
    },
  };
}

function createTransform(yakPluginOptions: any) {
  return (
    data: string,
    modulePath: string,
    rootPath: string,
    sourceMap?: any,
  ) =>
    // https://github.com/vercel/next.js/blob/canary/packages/next/src/build/webpack/loaders/next-swc-loader.ts#L143
    swcTransform(data, {
      filename: modulePath,
      inputSourceMap: sourceMap,
      sourceMaps: true,
      sourceFileName: modulePath,
      sourceRoot: rootPath,
      jsc: {
        experimental: {
          plugins: [["yak-swc", yakPluginOptions]],
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
