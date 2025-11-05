import { transform as swcTransform } from "@swc/core";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { createContext, runInContext } from "node:vm";
import type { LoaderContext } from "webpack";
import { parseModule } from "../cross-file-resolver/parseModule.js";
import { resolveCrossFileConstant } from "../cross-file-resolver/resolveCrossFileConstant.js";
import type { YakConfigOptions } from "../withYak/index.js";
import { createDebugLogger } from "./lib/debugLogger.js";
import { extractCss } from "./lib/extractCss.js";
import { parseExports } from "./lib/resolveCrossFileSelectors.js";

const require = createRequire(import.meta.url);
const yakSwcPluginPath = require.resolve("yak-swc");

/**
 * This loader transforms styled-components styles to a static data-url import
 * The compile-time nexy-yak transformation takes javascript/typescript as input,
 * strips all inline css code and adds the css as static css urls
 * e.g.: `import "data:text/css;base64,"`
 */
export default async function cssExtractLoader(
  this: LoaderContext<{ yakOptions: YakConfigOptions; yakPluginOptions: any }>,
  code: string,
  sourceMap: string | undefined,
): Promise<string | void> {
  const callback = this.async();

  // process only files which include next-yak for maximal compile performance
  if (!code.includes("next-yak")) {
    return callback(null, code, sourceMap);
  }

  const {
    yakPluginOptions,
    yakOptions: { experiments },
  } = this.getOptions();
  const debugLog = createDebugLogger(this, experiments?.debug);
  const resolveTurbopack = this.getResolve({});
  const transform = createTransform(yakPluginOptions, yakSwcPluginPath);

  const resolveFn = (specifier: string, importer: string) => {
    return new Promise<string>((resolve, reject) => {
      resolveTurbopack(dirname(importer), specifier, (err, result) => {
        if (err) return reject(err);
        if (!result) return reject(new Error(`Could not resolve ${specifier}`));
        resolve(result);
      });
    });
  };

  const fsReadFile = (filePath: string) =>
    new Promise<string>((resolve, reject) =>
      this.fs.readFile(filePath, "utf-8", (err, result) => {
        if (err) return reject(err);
        if (!result) return reject(new Error(`File not found: ${filePath}`));
        resolve(result);
      }),
    );

  const result = await transform(
    code,
    this.resourcePath,
    this.rootContext,
    sourceMap,
  );
  debugLog("ts", result.code);

  let css = extractCss(result.code, "Css");
  debugLog("css", css);

  const { resolved } = await resolveCrossFileConstant(
    {
      parse: (modulePath) => {
        return parseModule(
          {
            transpilationMode: "Css",
            extractExports: async (modulePath) => {
              const sourceContents = await fsReadFile(modulePath);
              return parseExports(sourceContents);
            },
            getTransformed: async (modulePath) => {
              const sourceContent = await fsReadFile(modulePath);
              return transform(sourceContent, modulePath, this.rootContext);
            },
            evaluateYakModule: async (modulePath: string) => {
              const code = await fsReadFile(modulePath);

              const transformed = await swcTransform(code, {
                filename: modulePath,
                sourceFileName: modulePath,
                jsc: {
                  transform: {
                    react: { runtime: "automatic" },
                  },
                  experimental: {
                    plugins: [[yakSwcPluginPath, yakPluginOptions]],
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

  debugLog("css-resolved", resolved);
  return callback(null, codeWithCrossFileResolved, result.map);
}

function createTransform(yakPluginOptions: any, yakSwcPluginPath: string) {
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
          plugins: [[yakSwcPluginPath, yakPluginOptions]],
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
