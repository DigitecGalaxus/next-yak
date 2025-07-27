import { transformFileSync, transformSync } from "@swc/core";
import react from "@vitejs/plugin-react-swc";
import { promises as fs } from "fs";
import { resolve as nodeResolve } from "path";
import { pathToFileURL } from "url";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import {
  resolveCrossFileConstant,
  type ResolverCallbacks,
} from "./css-resolver";

function customTransformPlugin(): Plugin {
  let server: ViteDevServer;
  let mode: "dev" | "build" = "dev";

  return {
    name: "custom-transform-plugin",
    enforce: "pre",
    async configureServer(_server) {
      server = _server;
    },
    configResolved(config) {
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
      if (id.startsWith("\0virtual:yak-css:")) {
        const originalId = id
          .replace("\0virtual:yak-css:", "")
          .replace(/\.css$/, "");

        // Add for HMR
        this.addWatchFile(originalId);

        const result = transformFileSync(originalId, {
          filename: id,
          jsc: {
            parser: {
              syntax: "typescript",
              tsx: true,
            },
            transform: {
              react: {
                runtime: "automatic",
              },
            },
            experimental: {
              plugins: [
                ["yak-swc", { basePath: "/", transpilationMode: "Css" }],
              ],
            },
          },
        });

        const extractedCss = extractYakCss(result.code);

        const idToResolve = new RegExp(
          /--yak-css-import: url\("(.*):(.*)".*\)/,
        ).exec(extractedCss);

        if (!idToResolve?.[1]) {
          return extractedCss;
        }

        const resolved = await this.resolve(idToResolve[1], originalId);

        const callbacks: ResolverCallbacks = {
          resolveModule: async (moduleSpecifier: string, context: string) => {
            let importer = context;

            // These workarounds are necessary because webpacks resolution is more advanced
            if (context.endsWith("/src")) {
              // add virtual file path that the import comes from
              importer = context + "/index.tsx";
            } else if (!context.includes(".")) {
              // add a virtual extension to the path if it's not present
              importer = context + ".tsx"; // or '/package.json'
            }

            const resolved = await this.resolve(moduleSpecifier, importer);

            if (!resolved) {
              throw new Error(
                `Could not resolve ${moduleSpecifier} from ${context}`,
              );
            }
            return resolved.id;
          },

          readFile: async (filePath: string) => {
            const file = await fs.readFile(filePath, "utf-8");
            return file;
          },

          importModule: async (filePath: string) => {
            const fileUrl = pathToFileURL(filePath).href;

            if (mode === "dev") {
              const result = await server.ssrLoadModule(fileUrl);
              this.addWatchFile(filePath);
              return result;
            }

            // Build mode: execute .yak files (very limited, as we don't track imported modules from yak files)
            if (
              filePath.endsWith(".yak.ts") ||
              filePath.endsWith(".yak.tsx") ||
              filePath.endsWith(".yak.js") ||
              filePath.endsWith(".yak.jsx")
            ) {
              const sourceCode = await fs.readFile(filePath, "utf-8");
              const result = transformSync(sourceCode, {
                filename: filePath,
                jsc: {
                  parser: {
                    syntax:
                      filePath.endsWith(".ts") || filePath.endsWith(".tsx")
                        ? "typescript"
                        : "ecmascript",
                    tsx: filePath.endsWith(".tsx"),
                    jsx: filePath.endsWith(".jsx"),
                  },
                  transform: {
                    react: {
                      runtime: "automatic",
                    },
                  },
                  experimental: {
                    plugins: [
                      ["yak-swc", { basePath: "/", transpilationMode: "Css" }],
                    ],
                  },
                },
                module: {
                  type: "commonjs",
                },
              });

              const moduleExports = {};
              const moduleScope = {
                exports: moduleExports,
                module: { exports: moduleExports },
                require: () => ({}),
                __filename: filePath,
                __dirname: nodeResolve(filePath, ".."),
              };

              const moduleFunction = new Function(
                "exports",
                "module",
                "require",
                "__filename",
                "__dirname",
                result.code,
              );

              moduleFunction(
                moduleScope.exports,
                moduleScope.module,
                moduleScope.require,
                moduleScope.__filename,
                moduleScope.__dirname,
              );

              return moduleScope.module.exports || moduleScope.exports;
            }

            return {};
          },

          loadModule: async (filePath: string) => {
            if (mode === "dev") {
              await server.transformRequest(filePath);
              const mixinsModule = server.moduleGraph.getModuleById(filePath);
              const code = mixinsModule?.transformResult?.code || "";

              this.addWatchFile(filePath);

              return code;
            }

            const sourceCode = await fs.readFile(filePath, "utf-8");
            const result = transformSync(sourceCode, {
              filename: filePath,
              jsc: {
                parser: {
                  syntax:
                    filePath.endsWith(".ts") || filePath.endsWith(".tsx")
                      ? "typescript"
                      : "ecmascript",
                  tsx: filePath.endsWith(".tsx"),
                  jsx: filePath.endsWith(".jsx"),
                },
                transform: {
                  react: {
                    runtime: "automatic",
                  },
                },
                experimental: {
                  plugins: [
                    ["yak-swc", { basePath: "/", transpilationMode: "Css" }],
                  ],
                },
              },
            });
            return result.code;
          },

          addDependency: () => {
            if (resolved?.id) {
              this.addWatchFile(resolved.id);
            }
          },
        };

        const contextDir = nodeResolve("./src", idToResolve[1]);
        const transformedCode = await resolveCrossFileConstant(
          callbacks,
          contextDir,
          extractedCss,
        );

        return transformedCode;
      }

      return null;
    },

    transform(code, id) {
      if (
        id.endsWith(".ts") ||
        id.endsWith(".tsx") ||
        id.endsWith(".js") ||
        id.endsWith(".jsx")
      ) {
        try {
          const result = transformSync(code, {
            filename: id,
            jsc: {
              parser: {
                syntax:
                  id.endsWith(".ts") || id.endsWith(".tsx")
                    ? "typescript"
                    : "ecmascript",
                tsx: id.endsWith(".tsx"),
                jsx: id.endsWith(".jsx"),
              },
              transform: {
                react: {
                  runtime: "automatic",
                },
              },
              experimental: {
                plugins: [
                  ["yak-swc", { basePath: "/", transpilationMode: "Css" }],
                ],
              },
            },
          });

          // Clean up the webpack-style import to make it a virtual CSS import
          let cleanedCode = result.code;
          if (cleanedCode.includes("!=!")) {
            cleanedCode = cleanedCode.replace(
              /import\s+["']([^"']+\.yak\.css)!=![^"']*["'];?/g,
              `import "virtual:yak-css:${id}.css";`,
            );
          }

          return {
            code: cleanedCode,
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

/**
 * Extract CSS from YAK Extracted CSS comments in the transformed source code.
 *
 * YAK generates CSS in comments that contain "YAK Extracted CSS:" followed by the CSS content.
 */
function extractYakCss(sourceContent: string): string {
  const cssBlocks: string[] = [];

  // Regex to match YAK Extracted CSS comments
  const yakCssRegex = /\/\*YAK Extracted CSS:\s*([\s\S]*?)\s*\*\//g;

  let match;
  while ((match = yakCssRegex.exec(sourceContent)) !== null) {
    const cssContent = match[1].trim();
    if (cssContent) {
      cssBlocks.push(cssContent);
    }
  }

  const result = cssBlocks.join("\n\n");
  return result;
}

export default defineConfig({
  plugins: [react(), customTransformPlugin()],
});
