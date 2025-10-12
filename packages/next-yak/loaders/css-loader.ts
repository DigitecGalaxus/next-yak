import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { transformSync } from "@swc/core";
import { dirname, relative } from "path";
import type { LoaderContext } from "webpack";
import {
  ModuleExport,
  ModuleExports,
  parseModule,
} from "../cross-file-resolver/parseModule.js";
import { resolveCrossFileConstant } from "../cross-file-resolver/resolveCrossFileConstant.js";
import type { YakConfigOptions } from "../withYak/index.js";

// https://github.com/vercel/next.js/blob/canary/packages/next/src/build/webpack/loaders/next-swc-loader.ts#L143

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

  if (_code.includes("next-yak")) {
    const result = transformSync(_code, {
      filename: this.resourcePath,
      inputSourceMap: sourceMap ? JSON.stringify(sourceMap) : undefined,
      // sourceMaps: sourceMap,
      // inlineSourceContent: sourceMap,
      sourceFileName: this.resourcePath,
      sourceRoot: this.rootContext,
      jsc: {
        transform: {
          react: {
            runtime: "automatic",
          },
        },
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
                      if (data) {
                        return resolve(
                          transformSync(data, {
                            filename: modulePath,
                            inputSourceMap: sourceMap
                              ? JSON.stringify(sourceMap)
                              : undefined,
                            // sourceMaps: sourceMap,
                            // inlineSourceContent: sourceMap,
                            sourceFileName: modulePath,
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
                          }),
                        );
                      }
                    });
                  },
                );
              },
              evaluateYakModule: async (modulePath) => {
                if (
                  modulePath.endsWith(".yak.ts") ||
                  modulePath.endsWith(".yak.tsx") ||
                  modulePath.endsWith(".yak.js") ||
                  modulePath.endsWith(".yak.jsx")
                ) {
                  const result = await new Promise<
                    ReturnType<typeof transformSync>
                  >((resolve, reject) => {
                    this.fs.readFile(modulePath, "utf-8", (err, data) => {
                      if (data) {
                        return resolve(
                          transformSync(data, {
                            filename: modulePath,
                            inputSourceMap: sourceMap
                              ? JSON.stringify(sourceMap)
                              : undefined,
                            // sourceMaps: sourceMap,
                            // inlineSourceContent: sourceMap,
                            sourceFileName: modulePath,
                            sourceRoot: this.rootContext,
                            jsc: {
                              transform: {
                                react: {
                                  runtime: "automatic",
                                },
                              },
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
                            },
                            module: {
                              type: "commonjs",
                            },
                          }),
                        );
                      }
                    });
                  });

                  const moduleExports = {};
                  const moduleScope = {
                    exports: moduleExports,
                    module: { exports: moduleExports },
                    require: () => ({}),
                    __filename: modulePath,
                    __dirname: dirname(modulePath),
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
            },
            modulePath,
          );
        },
        resolve: (specifier, importer) => {
          return new Promise<string>((resolve, reject) => {
            this.getResolve({})(dirname(importer), specifier, (err, result) => {
              if (err) return reject(err);
              if (!result)
                return reject(new Error(`Could not resolve ${specifier}`));
              resolve(result);
            });
          });
        },
      },
      this.resourcePath,
      css,
    );

    const dataUrl = result.code
      .split("\n")
      .find((line) => line.includes("data:text/css;base64"))!;

    let newCode = result.code.replace(
      dataUrl,
      `import "data:text/css;base64,${Buffer.from(resolved).toString("base64")}"`,
    );
    return callback(null, newCode, sourceMap);
  }
  return callback(null, _code, sourceMap);
}

async function parseExports(sourceContents: string): Promise<ModuleExports> {
  const moduleExports: ModuleExports = {
    importYak: true,
    named: {},
    all: [],
  };

  // Track variable declarations for lookup
  const variableDeclarations: Record<string, babel.types.Expression> = {};

  // Track default export identifier if present
  let defaultIdentifier: string | null = null;

  try {
    const ast = parse(sourceContents, {
      sourceType: "module",
      plugins: ["jsx", "typescript"] as const,
    });

    traverse.default(ast, {
      // Track all variable declarations in the file
      VariableDeclarator({ node }) {
        if (node.id.type === "Identifier" && node.init) {
          variableDeclarations[node.id.name] = node.init;
        }
      },

      ExportNamedDeclaration({ node }) {
        if (node.source) {
          node.specifiers.forEach((specifier) => {
            if (
              specifier.type === "ExportSpecifier" &&
              specifier.exported.type === "Identifier" &&
              specifier.local.type === "Identifier"
            ) {
              moduleExports.named[specifier.exported.name] = {
                type: "re-export",
                from: node.source!.value,
                name: specifier.local.name,
              };
            }
          });
        } else if (node.declaration?.type === "VariableDeclaration") {
          node.declaration.declarations.forEach((declaration) => {
            if (declaration.id.type === "Identifier" && declaration.init) {
              const parsed = parseExportValueExpression(declaration.init);
              if (parsed) {
                moduleExports.named[declaration.id.name] = parsed;
              }
            }
          });
        }
      },
      ExportDeclaration({ node }) {
        if ("specifiers" in node && node.source) {
          const { specifiers, source } = node;
          specifiers.forEach((specifier) => {
            // export * as color from "./colors";
            if (
              specifier.type === "ExportNamespaceSpecifier" &&
              specifier.exported.type === "Identifier"
            ) {
              moduleExports.named[specifier.exported.name] = {
                type: "namespace-re-export",
                from: source.value,
              };
            }
          });
        }
      },
      ExportDefaultDeclaration({ node }) {
        if (node.declaration.type === "Identifier") {
          // e.g. export default variableName;
          // Save the identifier name to look up later
          defaultIdentifier = node.declaration.name;
        } else if (
          node.declaration.type === "FunctionDeclaration" ||
          node.declaration.type === "ClassDeclaration"
        ) {
          // e.g. export default function() {...} or export default class {...}
          moduleExports.named["default"] = {
            type: "unsupported",
            hint: node.declaration.type,
          };
        } else {
          // e.g. export default { ... } or export default "value"
          moduleExports.named["default"] = parseExportValueExpression(
            node.declaration as babel.types.Expression,
          );
        }
      },
      ExportAllDeclaration({ node }) {
        moduleExports.all.push(node.source.value);
      },
    });
    // If we found a default export that's an identifier, look up its value
    if (defaultIdentifier && variableDeclarations[defaultIdentifier]) {
      moduleExports.named["default"] = parseExportValueExpression(
        variableDeclarations[defaultIdentifier],
      );
    }

    return moduleExports;
  } catch (error) {
    throw new Error(`Error parsing exports: ${(error as Error).message}`);
  }
}

/**
 * Unpacks a TSAsExpression to its expression value
 */
function unpackTSAsExpression(
  node: babel.types.TSAsExpression | babel.types.Expression,
): babel.types.Expression {
  if (node.type === "TSAsExpression") {
    return unpackTSAsExpression(node.expression);
  }
  return node;
}

function parseExportValueExpression(
  node: babel.types.Expression,
): ModuleExport {
  // ignores `as` casts so it doesn't interfere with the ast node type detection
  const expression = unpackTSAsExpression(node);
  if (
    expression.type === "CallExpression" ||
    expression.type === "TaggedTemplateExpression"
  ) {
    return { type: "tag-template" };
  } else if (
    expression.type === "StringLiteral" ||
    expression.type === "NumericLiteral"
  ) {
    return { type: "constant", value: expression.value };
  } else if (
    expression.type === "UnaryExpression" &&
    expression.operator === "-" &&
    expression.argument.type === "NumericLiteral"
  ) {
    return { type: "constant", value: -expression.argument.value };
  } else if (
    expression.type === "TemplateLiteral" &&
    expression.quasis.length === 1
  ) {
    return { type: "constant", value: expression.quasis[0].value.raw };
  } else if (expression.type === "ObjectExpression") {
    return { type: "record", value: parseObjectExpression(expression) };
  }
  return { type: "unsupported", hint: expression.type };
}

function parseObjectExpression(
  node: babel.types.ObjectExpression,
): Record<string, ModuleExport> {
  let result: Record<string, ModuleExport> = {};
  for (const property of node.properties) {
    if (
      property.type === "ObjectProperty" &&
      property.key.type === "Identifier"
    ) {
      const key = property.key.name;
      const parsed = parseExportValueExpression(
        property.value as babel.types.Expression,
      );
      if (parsed) {
        result[key] = parsed;
      }
    }
  }
  return result;
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
