import { parse } from "@babel/parser";
import type { Compilation, LoaderContext } from "webpack";
import {
  ModuleExport,
  ModuleExports,
  ParseContext,
  ParsedModule,
  UnsupportedExportSource,
  parseModule,
} from "../../cross-file-resolver/parseModule.js";
import {
  ResolveContext,
  resolveCrossFileConstant as genericResolveCrossFileConstant,
} from "../../cross-file-resolver/resolveCrossFileConstant.js";
import { YakConfigOptions } from "../../withYak/index.js";

const compilationCache = new WeakMap<
  Compilation,
  {
    parsedFiles: Map<string, ParsedModule>;
  }
>();

export async function resolveCrossFileConstant(
  loader: LoaderContext<{}>,
  pathContext: string,
  css: string,
): Promise<string> {
  const { resolved } = await genericResolveCrossFileConstant(
    getResolveContext(loader),
    loader.resourcePath,
    css,
  );
  return resolved;
}

function getCompilationCache(loader: LoaderContext<YakConfigOptions>) {
  const compilation = loader._compilation;
  if (!compilation) {
    throw new Error("Webpack compilation object not available");
  }
  let cache = compilationCache.get(compilation);
  if (!cache) {
    cache = {
      parsedFiles: new Map(),
    };
    compilationCache.set(compilation, cache);
  }
  return cache;
}

function getParseContext(loader: LoaderContext<YakConfigOptions>): ParseContext {
  return {
    cache: { parse: getCompilationCache(loader).parsedFiles },
    async extractExports(modulePath) {
      const sourceContents = new Promise<string>((resolve, reject) =>
        loader.fs.readFile(modulePath, "utf-8", (err, result) => {
          if (err) return reject(err);
          resolve(result || "");
        }),
      );
      return parseExports(await sourceContents);
    },
    async getTransformed(modulePath) {
      const transformedSource = new Promise<string>((resolve, reject) => {
        loader.loadModule(modulePath, (err, source) => {
          if (err) {
            // When webpack reports "The loaded module contains errors",
            // the actual errors are stored on the module in the compilation.
            // Extract and report the real errors for better debugging.
            const compilation = loader._compilation;
            if (compilation) {
              try {
                for (const mod of compilation.modules) {
                  if ("resource" in mod && mod.resource === modulePath) {
                    const errors = mod.getErrors();
                    if (errors) {
                      const messages = Array.from(errors)
                        .map((e) => e.message)
                        .filter(Boolean);
                      if (messages.length > 0) {
                        return reject(new Error(messages.join("\n")));
                      }
                    }
                  }
                }
              } catch {
                // Ignore errors while trying to extract module errors
              }
            }
            return reject(err);
          }
          let sourceString: string;
          if (typeof source === "string") {
            sourceString = source;
          } else if (source instanceof Buffer) {
            sourceString = source.toString("utf-8");
          } else if (source instanceof ArrayBuffer) {
            sourceString = new TextDecoder("utf-8").decode(source);
          } else {
            throw new Error("Invalid input type: code must be string, Buffer, or ArrayBuffer");
          }
          resolve(sourceString || "");
        });
      });
      return { code: await transformedSource };
    },
    async evaluateYakModule(modulePath) {
      return loader.importModule(modulePath);
    },
    transpilationMode: loader.getOptions().experiments?.transpilationMode,
  };
}

function getResolveContext(loader: LoaderContext<YakConfigOptions>): ResolveContext {
  const parseContext = getParseContext(loader);
  return {
    parse: (modulePath) => parseModule(parseContext, modulePath),
    resolve: async (specifier, importer) => {
      return resolveModule(loader, specifier, dirname(importer));
    },
  };
}

/**
 * Resolves a module by wrapping loader.resolve in a promise
 */
export async function resolveModule(
  loader: LoaderContext<{}>,
  moduleSpecifier: string,
  context: string,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    loader.resolve(context, moduleSpecifier, (err, result) => {
      if (err) return reject(err);
      if (!result) return reject(new Error(`Could not resolve ${moduleSpecifier}`));
      resolve(result);
    });
  });
}

export async function parseExports(sourceContents: string): Promise<ModuleExports> {
  try {
    const ast = parse(sourceContents, {
      sourceType: "module",
      plugins: ["jsx", "typescript"] as const,
    });

    // Derive importYak from top-level imports (no traverse needed)
    const importYak = ast.program.body.some(
      (node) => node.type === "ImportDeclaration" && node.source.value === "next-yak",
    );

    const moduleExports: ModuleExports = {
      importYak,
      named: {},
      all: [],
    };

    // Track variable declarations for default export lookup
    const variableDeclarations: Record<string, babel.types.Expression> = {};
    let defaultIdentifier: string | null = null;

    for (const node of ast.program.body) {
      // Track top-level variable declarations for default export lookup
      if (node.type === "VariableDeclaration") {
        for (const decl of node.declarations) {
          if (decl.id.type === "Identifier" && decl.init) {
            variableDeclarations[decl.id.name] = decl.init;
          }
        }
      }

      if (node.type === "ExportNamedDeclaration") {
        if (node.source) {
          // export { x } from "./file", export { x as y } from "./file"
          for (const specifier of node.specifiers) {
            if (
              specifier.type === "ExportSpecifier" &&
              specifier.exported.type === "Identifier" &&
              specifier.local.type === "Identifier"
            ) {
              moduleExports.named[specifier.exported.name] = {
                type: "re-export",
                from: node.source.value,
                name: specifier.local.name,
              };
            }
            // export * as ns from "./file"
            if (
              specifier.type === "ExportNamespaceSpecifier" &&
              specifier.exported.type === "Identifier"
            ) {
              moduleExports.named[specifier.exported.name] = {
                type: "namespace-re-export",
                from: node.source.value,
              };
            }
          }
        } else if (node.declaration?.type === "VariableDeclaration") {
          // export const x = ...
          for (const declaration of node.declaration.declarations) {
            if (declaration.id.type === "Identifier" && declaration.init) {
              variableDeclarations[declaration.id.name] = declaration.init;
              const parsed = parseExportValueExpression(declaration.init, sourceContents);
              if (parsed) {
                moduleExports.named[declaration.id.name] = parsed;
              }
            }
          }
        }
      }

      if (node.type === "ExportDefaultDeclaration") {
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
            source: extractUnsupportedSource(node.declaration.loc, sourceContents),
          };
        } else {
          // e.g. export default { ... } or export default "value"
          moduleExports.named["default"] = parseExportValueExpression(
            node.declaration as babel.types.Expression,
            sourceContents,
          );
        }
      }

      // export * from "./file"
      if (node.type === "ExportAllDeclaration") {
        moduleExports.all.push(node.source.value);
      }
    }

    // If we found a default export that's an identifier, look up its value
    if (defaultIdentifier && variableDeclarations[defaultIdentifier]) {
      moduleExports.named["default"] = parseExportValueExpression(
        variableDeclarations[defaultIdentifier],
        sourceContents,
      );
    }

    return moduleExports;
  } catch (error) {
    throw new Error(`Error parsing exports: ${(error as Error).message}`);
  }
}

/**
 * Unpacks TS type assertions (as, satisfies) to the underlying expression
 */
function unpackTSAsExpression(
  node: babel.types.TSAsExpression | babel.types.Expression,
): babel.types.Expression {
  if (node.type === "TSAsExpression" || node.type === "TSSatisfiesExpression") {
    return unpackTSAsExpression((node as babel.types.TSAsExpression).expression);
  }
  return node;
}

function parseExportValueExpression(node: babel.types.Expression, code?: string): ModuleExport {
  // ignores `as` casts so it doesn't interfere with the ast node type detection
  const expression = unpackTSAsExpression(node);
  if (expression.type === "CallExpression" || expression.type === "TaggedTemplateExpression") {
    return { type: "tag-template" };
  } else if (expression.type === "StringLiteral" || expression.type === "NumericLiteral") {
    return { type: "constant", value: expression.value };
  } else if (
    expression.type === "UnaryExpression" &&
    expression.operator === "-" &&
    expression.argument.type === "NumericLiteral"
  ) {
    return { type: "constant", value: -expression.argument.value };
  } else if (expression.type === "TemplateLiteral" && expression.quasis.length === 1) {
    return { type: "constant", value: expression.quasis[0].value.raw };
  } else if (expression.type === "ObjectExpression") {
    return {
      type: "record",
      value: parseObjectExpression(expression, code),
    };
  }
  return {
    type: "unsupported",
    hint: expression.type,
    source: extractUnsupportedSource(expression.loc, code),
  };
}

function parseObjectExpression(
  node: babel.types.ObjectExpression,
  code?: string,
): Record<string, ModuleExport> {
  let result: Record<string, ModuleExport> = {};
  for (const property of node.properties) {
    if (property.type === "ObjectProperty" && property.key.type === "Identifier") {
      const key = property.key.name;
      const parsed = parseExportValueExpression(property.value as babel.types.Expression, code);
      if (parsed) {
        result[key] = parsed;
      }
    }
  }
  return result;
}

/**
 * Pull the structural source-location data the error formatter needs to
 * render a snippet — the formatter (not this parser) is responsible for
 * any presentation. Returns undefined if loc or source text is missing.
 */
function extractUnsupportedSource(
  loc:
    | {
        start: { line: number; column: number };
        end: { line: number; column: number };
      }
    | null
    | undefined,
  code: string | undefined,
): UnsupportedExportSource | undefined {
  if (!loc || !code) return undefined;
  const lineText = code.split(/\r?\n/)[loc.start.line - 1];
  if (lineText === undefined) return undefined;
  return {
    start: { line: loc.start.line, column: loc.start.column },
    end: { line: loc.end.line, column: loc.end.column },
    lineText,
  };
}

const DIRNAME_POSIX_REGEX =
  /^((?:\.(?![^/]))|(?:(?:\/?|)(?:[\s\S]*?)))(?:\/+?|)(?:(?:\.{1,2}|[^/]+?|)(?:\.[^./]*|))(?:[/]*)$/;
const DIRNAME_WIN32_REGEX =
  /^((?:\.(?![^\\]))|(?:(?:\\?|)(?:[\s\S]*?)))(?:\\+?|)(?:(?:\.{1,2}|[^\\]+?|)(?:\.[^.\\]*|))(?:[\\]*)$/;

/**
 * Polyfill for `node:path` method dirname.
 * Keeps yak independent from node api (therefore executable in browser)
 */
function dirname(path: string) {
  let dirname = DIRNAME_POSIX_REGEX.exec(path)?.[1];

  if (!dirname) {
    dirname = DIRNAME_WIN32_REGEX.exec(path)?.[1];
  }

  if (!dirname) {
    throw new Error(`Can't extract dirname from ${path}`);
  }

  return dirname;
}
