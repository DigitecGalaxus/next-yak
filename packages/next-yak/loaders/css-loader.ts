import { transformSync } from "@swc/core";
import { relative } from "path";
import type { LoaderContext } from "webpack";
import type { YakConfigOptions } from "../withYak/index.js";

const yakCssImportRegex =
  // Make mixin and selector non optional once we dropped support for the babel plugin
  /--yak-css-import\:\s*url\("([^"]+)",?(|mixin|selector)\)(;?)/g;

async function parseYakCssImport(
  resolve: (spec: string) => Promise<{}>,
  css: string,
) {
  const yakImports: any[] = [];

  for (const match of css.matchAll(yakCssImportRegex)) {
    const [fullMatch, encodedArguments, importKind, semicolon] = match;
    const [moduleSpecifier, ...specifier] = encodedArguments
      .split(":")
      .map((entry) => decodeURIComponent(entry));

    yakImports.push({
      encodedArguments,
      moduleSpecifier: await resolve(moduleSpecifier),
      specifier,
      importKind: importKind as any,
      semicolon,
      position: match.index,
      size: fullMatch.length,
    });
  }

  return yakImports;
}

// https://github.com/vercel/next.js/blob/canary/packages/next/src/build/webpack/loaders/next-swc-loader.ts#L143

function parseStyledComponents(sourceContents: string) {
  // cross-file Styled Components are always in the following format:
  // /*YAK EXPORTED STYLED:ComponentName:ClassName*/
  const styledParts = sourceContents.split("/*YAK EXPORTED STYLED:");
  let styledComponents: any = {};

  for (let i = 1; i < styledParts.length; i++) {
    const [comment] = styledParts[i].split("*/", 1);
    const [componentName, className] = comment.split(":");
    styledComponents[componentName] = {
      type: "styled-component",
      nameParts: componentName.split("."),
      value: `.${className}`,
    };
  }

  return styledComponents;
}
/**
 * Transform typescript to css
 *
 * This loader takes the cached result from the yak tsloader
 * and extracts the css from the generated comments
 */
export default async function cssExtractLoader(
  this: LoaderContext<YakConfigOptions>,
  // Instead of the source code, we receive the extracted css
  // from the yak-swc transformation
  _code: string,
  sourceMap: string | undefined,
): Promise<string | void> {
  const callback = this.async();

  if (
    this.currentRequest.includes("app/page") ||
    this.currentRequest.includes("button")
  ) {
    const result = transformSync(_code, {
      filename: this.resourcePath,
      inputSourceMap: sourceMap ? JSON.stringify(sourceMap) : undefined,
      // sourceMaps: sourceMap,
      // inlineSourceContent: sourceMap,
      sourceFileName: this.resourcePath,
      sourceRoot: this.rootContext,
      jsc: {
        experimental: {
          plugins: [
            [
              "yak-swc",
              {
                minify: false,
                basePath: this.rootContext,
                displayNames: true,
                transpilationMode: "DataUrl",
              },
            ],
          ],
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

    let css = extractCss(result.code, "Css");
    // @ts-ignore
    const yakImports = await parseYakCssImport((moduleSpecifier) => {
      // @ts-ignore
      return this.getResolve({})(this.context, moduleSpecifier);
    }, css);

    if (yakImports.length === 0) {
      return callback(null, result.code, sourceMap);
    } else {
      const dataUrl = result.code
        .split("\n")
        .find((line) => line.includes("data:text/css;base64"))!;
      const code = await new Promise<string>((resolve, reject) => {
        this.fs.readFile(
          yakImports[0].moduleSpecifier,
          "utf-8",
          (err, data) => {
            if (data) {
              const transformed = transformSync(data, {
                filename: yakImports[0].moduleSpecifier,
                inputSourceMap: sourceMap
                  ? JSON.stringify(sourceMap)
                  : undefined,
                // sourceMaps: sourceMap,
                // inlineSourceContent: sourceMap,
                sourceFileName: yakImports[0].moduleSpecifier,
                sourceRoot: this.rootContext,
                jsc: {
                  experimental: {
                    plugins: [
                      [
                        "yak-swc",
                        {
                          minify: false,
                          basePath: this.rootContext,
                          displayNames: true,
                          transpilationMode: "DataUrl",
                        },
                      ],
                    ],
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
              const styledComponents = parseStyledComponents(transformed.code);
              css = css.replace(
                '--yak-css-import: url("../../components/button:Button",selector)',
                styledComponents.Button.value,
              );

              return resolve(
                result.code.replace(
                  dataUrl,
                  `import "data:text/css;base64,${Buffer.from(css).toString("base64")}"`,
                ),
              );
            }
          },
        );
      });

      return callback(null, "import React from 'react';\n" + code, sourceMap);
    }
  }
  return callback(null, _code, sourceMap);
}

function extractCss(
  code: string | Buffer<ArrayBufferLike>,
  transpilationMode: NonNullable<
    YakConfigOptions["experiments"]
  >["transpilationMode"],
): string {
  let codeString: string;

  if (typeof code === "string") {
    codeString = code;
  } else if (code instanceof Buffer) {
    codeString = code.toString("utf-8");
  } else if (code instanceof ArrayBuffer) {
    codeString = new TextDecoder("utf-8").decode(code);
  } else {
    throw new Error(
      "Invalid input type: code must be string, Buffer, or ArrayBuffer",
    );
  }

  const codeParts = codeString.split("/*YAK Extracted CSS:\n");
  let result = "";
  for (let i = 1; i < codeParts.length; i++) {
    const codeUntilEnd = codeParts[i].split("*/")[0];
    result += codeUntilEnd;
  }
  if (result && transpilationMode !== "Css") {
    result = "/* cssmodules-pure-no-check */\n" + result;
  }

  return result;
}

function createDebugLogger(
  loaderContext: LoaderContext<YakConfigOptions>,
  debugOptions: Required<YakConfigOptions>["experiments"]["debug"],
) {
  if (
    !debugOptions ||
    (debugOptions !== true &&
      debugOptions.filter &&
      !debugOptions.filter(loaderContext.resourcePath))
  ) {
    return () => {};
  }
  const debugType = debugOptions === true ? "ts" : debugOptions.type;
  return (
    messageType: "ts" | "css" | "css resolved",
    message: string | Buffer<ArrayBufferLike> | undefined,
  ) => {
    if (messageType === debugType || debugType === "all") {
      console.log(
        "🐮 Yak",
        messageType,
        "\n",
        loaderContext._compiler
          ? relative(
              loaderContext._compiler.context,
              loaderContext.resourcePath,
            )
          : loaderContext.resourcePath,
        "\n\n",
        message,
      );
    }
  };
}
