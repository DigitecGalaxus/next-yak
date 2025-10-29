import { transformSync } from "@swc/core";
import { dirname } from "node:path";
import { createContext, runInContext } from "node:vm";
import type { LoaderContext } from "webpack";
import { parseModule } from "../cross-file-resolver/parseModule.js";
import { resolveCrossFileConstant } from "../cross-file-resolver/resolveCrossFileConstant.js";
import type { YakConfigOptions } from "../withYak/index.js";
import { extractCss } from "./lib/extractCss.js";
import { parseExports } from "./lib/resolveCrossFileSelectors.js";

/**
 * This loader transforms styled-components styles to a static data-url import
 */
export default async function cssExtractLoader(
  this: LoaderContext<{ yakOptions: YakConfigOptions; yakPluginOptions: any }>,
  code: string,
  sourceMap: string | undefined,
): Promise<string | void> {
  const callback = this.async();

  if (!code.includes("next-yak")) {
    return callback(null, code, sourceMap);
  }

  const {
    yakPluginOptions,
    yakOptions: { experiments },
  } = this.getOptions();
  const debugLog = createDebugLogger(this, experiments?.debug as any);
  const transform = createTransform(yakPluginOptions);

  const resolveFn = (specifier: string, importer: string) => {
    return new Promise<string>((resolve, reject) => {
      this.getResolve({})(dirname(importer), specifier, (err, result) => {
        if (err) return reject(err);
        if (!result) return reject(new Error(`Could not resolve ${specifier}`));
        resolve(result);
      });
    });
  };

  const result = transform(
    code,
    this.resourcePath,
    this.rootContext,
    sourceMap,
  );
  let css = extractCss(result.code, "Css");

  const { resolved } = await resolveCrossFileConstant(
    {
      parse: (modulePath) => {
        return parseModule(
          {
            transpilationMode: "Css",
            extractExports: async (modulePath) => {
              const sourceContents = new Promise<string>((resolve, reject) =>
                this.fs.readFile(modulePath, "utf-8", (err, result) => {
                  if (err) return reject(err);
                  resolve(result || "");
                }),
              );
              return parseExports(await sourceContents);
            },
            getTransformed: async (modulePath) => {
              return await new Promise<ReturnType<typeof transformSync>>(
                (resolve, reject) => {
                  this.fs.readFile(modulePath, "utf-8", (err, data) => {
                    if (err) return reject(err);
                    if (data) {
                      return resolve(
                        transform(data, modulePath, this.rootContext),
                      );
                    }
                  });
                },
              );
            },
            evaluateYakModule: async (modulePath: string) => {
              const code = await new Promise<string>((resolve, reject) => {
                this.fs.readFile(modulePath, "utf-8", (err, data) => {
                  if (err) return reject(err);
                  if (data) {
                    return resolve(data);
                  }
                  return reject(new Error(`File not found: ${modulePath}`));
                });
              });

              const transformed = transformSync(code, {
                filename: modulePath,
                sourceFileName: modulePath,
                jsc: {
                  transform: {
                    react: { runtime: "automatic" },
                  },
                  experimental: {
                    plugins: [["yak-swc", yakPluginOptions]],
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
                      `Yak files should be self-contained and only export constants or styled components.\n`,
                  );
                },
                __filename: modulePath,
                __dirname: dirname(modulePath),
                global: globalThis,
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
    this.resourcePath,
    css,
  );

  const dataUrl = result.code
    .split("\n")
    .find((line) => line.includes("data:text/css;base64"))!;

  const codeWithCrossFileResolved = result.code.replace(
    dataUrl,
    `import "data:text/css;base64,${Buffer.from(resolved).toString("base64")}"`,
  );

  debugLog(codeWithCrossFileResolved);
  return callback(null, codeWithCrossFileResolved, result.map);
}

function createTransform(yakPluginOptions: any) {
  return (
    data: string,
    modulePath: string,
    rootPath: string,
    sourceMap?: any,
  ) =>
    // https://github.com/vercel/next.js/blob/canary/packages/next/src/build/webpack/loaders/next-swc-loader.ts#L143
    transformSync(data, {
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
            runtime: "automatic",
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

function createDebugLogger(
  loaderContext: LoaderContext<any>,
  debugOptions: boolean | undefined,
) {
  if (!debugOptions || debugOptions !== true) {
    return () => {};
  }
  return (message: string | Buffer<ArrayBufferLike> | undefined) => {
    console.log(
      "🐮 Yak",
      "ts",
      "\n",
      loaderContext.resourcePath,
      "\n\n",
      message,
    );
  };
}
