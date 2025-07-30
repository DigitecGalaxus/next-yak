import {
  ParseContext,
  parseModule,
  ParsedModule,
  ModuleExports,
  ModuleExport,
} from "../../cross-file-resolver/parseModule.js";
import {
  ResolveContext,
  resolveCrossFileConstant as genericResolveCrossFileConstant,
} from "../../cross-file-resolver/resolveCrossFileConstant.js";
import type { Compilation, LoaderContext } from "webpack";
import { YakConfigOptions } from "../../withYak/index.js";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

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

function getParseContext(
  loader: LoaderContext<YakConfigOptions>,
): ParseContext {
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
      const tranformedSource = new Promise<string>((resolve, reject) => {
        loader.loadModule(modulePath, (err, source) => {
          if (err) return reject(err);
          let sourceString: string;
          if (typeof source === "string") {
            sourceString = source;
          } else if (source instanceof Buffer) {
            sourceString = source.toString("utf-8");
          } else if (source instanceof ArrayBuffer) {
            sourceString = new TextDecoder("utf-8").decode(source);
          } else {
            throw new Error(
              "Invalid input type: code must be string, Buffer, or ArrayBuffer",
            );
          }
          resolve(sourceString || "");
        });
      });
      return { code: await tranformedSource };
    },
    async evaluateYakModule(modulePath) {
      return loader.importModule(modulePath);
    },
  };
}

function getResolveContext(
  loader: LoaderContext<YakConfigOptions>,
): ResolveContext {
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
      if (!result)
        return reject(new Error(`Could not resolve ${moduleSpecifier}`));
      resolve(result);
    });
  });
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

const DIRNAME_POSIX_REGEX =
  /^((?:\.(?![^\/]))|(?:(?:\/?|)(?:[\s\S]*?)))(?:\/+?|)(?:(?:\.{1,2}|[^\/]+?|)(?:\.[^.\/]*|))(?:[\/]*)$/;
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
