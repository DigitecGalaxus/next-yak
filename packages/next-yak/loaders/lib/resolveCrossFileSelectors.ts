import path from "path";
import babel from "@babel/core";
// @ts-expect-error - this is used by babel directly so we ignore that it is not typed
import babelPlugin from "@babel/plugin-syntax-typescript";
import type { Compilation, LoaderContext } from "webpack";
import { getCssModuleLocalIdent } from "next/dist/build/webpack/config/blocks/css/loaders/getCssModuleLocalIdent.js";

const yakCssImportRegex =
  // Make mixin and selector non optional once we dropped support for the babel plugin
  /--yak-css-import\:\s*url\("([^"]+)",?(|mixin|selector)\)(;?)/g;

const compilationCache = new WeakMap<
  Compilation,
  Map<string, Promise<ParsedFile>>
>();

/**
 * Resolves cross-file selectors in css files
 *
 * e.g.:
 * theme.ts:
 * ```ts
 * export const colors = {
 *   primary: "#ff0000",
 *   secondary: "#00ff00",
 * };
 * ```
 *
 * styles.ts:
 * ```ts
 * import { colors } from "./theme";
 * export const button = css`
 *  background-color: ${colors.primary};
 * `;
 */
export async function resolveCrossFileConstant(
  loader: LoaderContext<{}>,
  pathContext: string,
  css: string,
): Promise<string> {
  // Search for --yak-css-import: url("path/to/module") in the css
  const matches = [...css.matchAll(yakCssImportRegex)].map((match) => {
    const [fullMatch, encodedArguments, importKind, semicolon] = match;
    const [moduleSpecifier, ...specifier] = encodedArguments
      .split(":")
      .map((entry) => decodeURIComponent(entry));
    return {
      encodedArguments,
      moduleSpecifier,
      specifier,
      importKind,
      semicolon,
      position: match.index!,
      size: fullMatch.length,
    };
  });
  if (matches.length === 0) return css;

  try {
    // Resolve all imports concurrently
    const exportCache = new Map<string, Promise<ResolvedExport>>();
    const resolvedValues = await Promise.all(
      matches.map(({ moduleSpecifier, specifier, encodedArguments }) => {
        // The cache prevents resolving the same specifier multiple times
        // e.g.:
        // const a = css`
        //   color: ${colors.primary};
        //   border-color: ${colors.primary};
        // `;
        const resolvedFromCache = exportCache.get(encodedArguments);
        const resolvedValue =
          resolvedFromCache ||
          parseModule(loader, moduleSpecifier, pathContext).then(
            (parsedModule) =>
              resolveModuleSpecifierRecursively(
                loader,
                parsedModule,
                specifier,
              ),
          );
        if (!resolvedFromCache) {
          exportCache.set(encodedArguments, resolvedValue);
        }
        return resolvedValue;
      }),
    );

    // Replace the imports with the resolved values
    let result = css;
    for (let i = matches.length - 1; i >= 0; i--) {
      const { position, size, importKind, specifier, semicolon } = matches[i];
      const resolved = resolvedValues[i];

      if (importKind === "selector") {
        if (resolved.type === "mixin") {
          throw new Error(
            `Found mixin but expected a selector - did you forget a semicolon after \`${specifier.join(
              ".",
            )}\`?`,
          );
        }
      }

      const replacement =
        resolved.type === "styled-component"
          ? `:global(.${getCssModuleLocalIdent(
              {
                rootContext: loader.rootContext,
                resourcePath: resolved.from,
              },
              null,
              resolved.name,
              {},
            )})`
          : resolved.value +
            // resolved.value can be of two different types:
            // - mixin:
            //   ${mixinName};
            // - constant:
            //   color: ${value};
            // For mixins the semicolon is already included in the value
            // but for constants it has to be added manually
            (["}", ";"].includes(String(resolved.value).trimEnd().slice(-1))
              ? ""
              : semicolon);

      result =
        result.slice(0, position) +
        String(replacement) +
        result.slice(position + size);
    }

    return result;
  } catch (error) {
    throw new Error(
      `Error resolving cross-file selectors: ${
        (error as Error).message
      }\nFile: ${loader.resourcePath}`,
    );
  }
}

/**
 * Resolves a module specifier to a parsed file
 *
 * e.g.:
 * ```
 * parseModule(loader, "./theme", "/path/to/styles.ts")
 * // -> { type: 'regular', secondary: { type: 'constant', value: '#00ff00' } } }, filePath: '/path/to/theme.ts' }
 * ```
 */
async function parseModule(
  loader: LoaderContext<{}>,
  moduleSpecifier: string,
  context: string,
): Promise<ParsedFile> {
  const compilation = loader._compilation;
  if (!compilation) {
    throw new Error("Webpack compilation object not available");
  }
  let cache = compilationCache.get(compilation);
  if (!cache) {
    cache = new Map();
    compilationCache.set(compilation, cache);
  }
  // The cache key is valid for the entire project so it can be reused
  // for different source files
  const cacheKey = path.resolve(context, moduleSpecifier);
  let filePromise = cache.get(cacheKey);
  if (!filePromise) {
    filePromise = (async () => {
      const resolved = await new Promise<string>((resolve, reject) => {
        loader.resolve(context, moduleSpecifier, (err, result) => {
          if (err) return reject(err);
          if (!result)
            return reject(new Error(`Could not resolve ${moduleSpecifier}`));
          resolve(result);
        });
      });
      return parseFile(loader, resolved);
    })();
    cache.set(cacheKey, filePromise);
  }
  // on file change, invalidate the cache
  loader.addDependency((await filePromise).filePath);
  return filePromise;
}

async function parseFile(
  loader: LoaderContext<{}>,
  filePath: string,
): Promise<ParsedFile> {
  const isYak =
    filePath.endsWith(".yak.ts") ||
    filePath.endsWith(".yak.tsx") ||
    filePath.endsWith(".yak.js") ||
    filePath.endsWith(".yak.jsx");
  const isTSX = filePath.endsWith(".tsx");

  try {
    if (isYak) {
      const module: Record<string, unknown> =
        await loader.importModule(filePath);
      const mappedModule = Object.fromEntries(
        Object.entries(module).map(([key, value]): [string, ParsedExport] => {
          if (typeof value === "string" || typeof value === "number") {
            return [key, { type: "constant" as const, value }];
          } else if (
            value &&
            (typeof value === "object" || Array.isArray(value))
          ) {
            return [key, { type: "record" as const, value }];
          } else {
            return [key, { type: "unsupported" as const }];
          }
        }),
      );
      return { type: "yak", exports: mappedModule, filePath };
    }
    const sourceContents = new Promise<string>((resolve, reject) =>
      loader.fs.readFile(filePath, "utf-8", (err, result) => {
        if (err) return reject(err);
        resolve(result || "");
      }),
    );

    const tranformedSource = new Promise<string>((resolve, reject) => {
      loader.loadModule(filePath, (err, source) => {
        if (err) return reject(err);
        resolve(source || "");
      });
    });

    const exports = await parseExports(await sourceContents, isTSX);
    const mixins = parseMixins(await tranformedSource);

    // Recursively resolve cross-file constants in mixins
    // e.g. cross file mixins inside a cross file mixin
    // or a cross file selector inside a cross file mixin
    await Promise.all(
      Object.entries(mixins).map(async ([name, {value, nameParts}]) => {
        const resolvedValue = await resolveCrossFileConstant(
          loader,
          path.dirname(filePath),
          value,
        );
        if (nameParts.length === 1) {
          exports[name] = { type: "mixin", value: resolvedValue };
        } else {
          let exportEntry: undefined | ParsedExport = exports[nameParts[0]];
          if (!exportEntry) {
            exportEntry = { type: "record", value: {} };
            exports[nameParts[0]] = exportEntry;
          } else if (exportEntry.type !== "record") {
            throw new Error(
              `Error parsing file ${filePath}: ${nameParts[0]} is not a record`,
            );
          }
          let current = exportEntry.value as Record<any, ParsedExport>;
          for (let i = 1; i < nameParts.length - 1; i++) {
            let next = current[nameParts[i]];
            if (!next) {
              next = { type: "record", value: {} };
              current[nameParts[i]] = next
            } else if (next.type !== "record") {
              throw new Error(
                `Error parsing file ${filePath}: ${nameParts[i]} is not a record`,
              );
            }
            current = next.value;
          }
          current[nameParts[nameParts.length - 1]] = { type: "mixin", value: resolvedValue };
        }
      }),
    );

    return {
      type: "regular",
      exports,
      filePath,
    };
  } catch (error) {
    throw new Error(
      `Error parsing file ${filePath}: ${(error as Error).message}`,
    );
  }
}

async function parseExports(
  sourceContents: string,
  isTSX: boolean,
): Promise<Record<string, ParsedExport>> {
  let exports: Record<string, ParsedExport> = {};

  try {
    babel.transformSync(sourceContents, {
      configFile: false,
      plugins: [
        [babelPlugin, { isTSX }],
        [
          (): babel.PluginObj => ({
            visitor: {
              ExportNamedDeclaration({ node }) {
                if (node.source) {
                  node.specifiers.forEach((specifier) => {
                    if (
                      specifier.type === "ExportSpecifier" &&
                      specifier.exported.type === "Identifier" &&
                      specifier.local.type === "Identifier"
                    ) {
                      exports[specifier.exported.name] = {
                        type: "re-export",
                        from: node.source!.value,
                        imported: specifier.local.name,
                      };
                    }
                  });
                } else if (node.declaration?.type === "VariableDeclaration") {
                  node.declaration.declarations.forEach((declaration) => {
                    if (
                      declaration.id.type === "Identifier" &&
                      declaration.init
                    ) {
                      exports[declaration.id.name] = parseExportValueExpression(
                        declaration.init,
                      );
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
                      exports[specifier.exported.name] = {
                        type: "star-export",
                        from: [source.value],
                      };
                    }
                  });
                }
              },
              ExportAllDeclaration({ node }) {
                if (Object.keys(exports).length === 0) {
                  exports["*"] ||= {
                    type: "star-export",
                    from: [],
                  };
                  if (exports["*"].type !== "star-export") {
                    throw new Error("Invalid star export state");
                  }
                  exports["*"].from.push(node.source.value);
                }
              },
            },
          }),
        ],
      ],
    });

    return exports;
  } catch (error) {
    throw new Error(`Error parsing exports: ${(error as Error).message}`);
  }
}

function parseMixins(
  sourceContents: string,
): Record<string, { type: "mixin"; value: string,
  nameParts: string[]
 }> {
  // Mixins are always in the following format:
  // /*YAK EXPORTED MIXIN:fancy:aspectRatio:16:9
  // css
  // */
  const mixinParts = sourceContents.split("/*YAK EXPORTED MIXIN:");
  let mixins: Record<string, { type: "mixin"; value: string, nameParts: string[]
   }> = {};
  
  for (let i = 1; i < mixinParts.length; i++) {
    const [comment] = mixinParts[i].split("*/", 1);
    const position = comment.indexOf("\n");
    const name = comment.slice(0, position);
    const value = comment.slice(position + 1);
    mixins[name] = { 
      type: "mixin", 
      value,
      nameParts: name.split(":").map(part => decodeURIComponent(part))
    };
  }
  return mixins;
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
): ParsedExport {
  // ignores `as` casts so it doesn't interfere with the ast node type detection
  const expression = unpackTSAsExpression(node);
  if (
    expression.type === "CallExpression" ||
    expression.type === "TaggedTemplateExpression"
  ) {
    return { type: "styled-component" };
  } else if (
    expression.type === "StringLiteral" ||
    expression.type === "NumericLiteral"
  ) {
    return { type: "constant", value: expression.value };
  } else if (
    expression.type === "TemplateLiteral" &&
    expression.quasis.length === 1
  ) {
    return { type: "constant", value: expression.quasis[0].value.raw };
  } else if (expression.type === "ObjectExpression") {
    return { type: "record", value: parseObjectExpression(expression) };
  }
  return { type: "unsupported" };
}

function parseObjectExpression(
  node: babel.types.ObjectExpression,
): Record<string, ParsedExport> {
  let result: Record<string, ParsedExport> = {};
  for (const property of node.properties) {
    if (
      property.type === "ObjectProperty" &&
      property.key.type === "Identifier"
    ) {
      const key = property.key.name;
      result[key] = parseExportValueExpression(
        property.value as babel.types.Expression,
      );
    }
  }
  return result;
}

/**
 * Follows a specifier recursively until it finds its constant value
 * for example here it follows "colors.primary"
 *
 * ```
 * resolveModuleSpecifierRecursively(loader, "@/theme", ["colors", "primary"], "colors:primary")`
 * // -> { type: 'constant', value: '#ff0000' }
 * ```
 *
 * example structure:
 *
 * styles.ts:
 * ```
 * import { colors } from "@/theme";
 * export const button = css`color: ${colors.primary}`;
 * ```
 *
 * theme.ts:
 * ```
 * export { colors } from "./colors";
 * ```
 *
 * colors.ts:
 * ```
 * export const colors = { primary: "#ff0000" };
 * ```
 *
 */
async function resolveModuleSpecifierRecursively(
  loader: LoaderContext<{}>,
  module: ParsedFile,
  specifier: string[],
): Promise<ResolvedExport> {
  try {
    const exportName = specifier[0];
    let exportValue = module.exports[exportName];
    // Follow star exports if there is only a single one
    // and the export does not exist in the current module
    if (exportValue === undefined) {
      const starExport = module.exports["*"];
      if (starExport?.type === "star-export") {
        if (starExport.from.length > 1) {
          throw new Error(
            `Could not resolve ${specifier.join(".")} in module ${
              module.filePath
            } - Multiple star exports are not supported for performance reasons`,
          );
        }
        exportValue = {
          type: "re-export" as const,
          from: starExport.from[0],
          imported: exportName,
        };
      } else {
        throw new Error(
          `Could not resolve "${specifier.join(".")}" in module ${
            module.filePath
          }`,
        );
      }
    }
    // Follow reexport
    // e.g. export { colors as primaryColors } from "./colors";
    if (exportValue.type === "re-export") {
      const importedModule = await parseModule(
        loader,
        exportValue.from,
        path.dirname(module.filePath),
      );
      return resolveModuleSpecifierRecursively(loader, importedModule, [
        exportValue.imported,
        ...specifier.slice(1),
      ]);
    }
    // Namespace export
    // e.g. export * as colors from "./colors";
    else if (exportValue.type === "star-export") {
      const importedModule = await parseModule(
        loader,
        exportValue.from[0],
        path.dirname(module.filePath),
      );
      return resolveModuleSpecifierRecursively(
        loader,
        importedModule,
        specifier.slice(1),
      );
    }

    if (exportValue.type === "styled-component") {
      return {
        type: "styled-component",
        from: module.filePath,
        name: specifier[specifier.length - 1],
      };
    } else if (exportValue.type === "constant") {
      return { type: "constant", value: exportValue.value };
    } else if (exportValue.type === "record") {
      let current: any = exportValue.value;
      let depth = 0;
      /// Drill down the specifier e.g. colors.primary
      do {
        if (typeof current === "string" || typeof current === "number") {
          return {
            type: "constant" as const,
            value: current,
          };
        } else if (
          !current ||
          (typeof current !== "object" && !Array.isArray(current))
        ) {
          throw new Error(
            `Error unpacking Record/Array "${exportName}".\nKey "${
              specifier[depth]
            }" was of type "${typeof current}" but only String and Number are supported`,
          );
        }
        depth++;
        // mixins in .yak files are wrapped inside an object with a __yak key
        if (depth === specifier.length && "__yak" in current) {
          return { type: "mixin", value: current["__yak"] };
        } else if (depth === specifier.length && "value" in current) {
          return { type: "constant", value: current["value"] };
        } else {
          current = current[specifier[depth]];
        }
      } while (current);
      if (specifier[depth] === undefined) {
        throw new Error(
          `Error unpacking Record/Array - could not extract \`${specifier
            .slice(0, depth)
            .join(".")}\` is not a string or number`,
        );
      }
      throw new Error(
        `Error unpacking Record/Array - could not extract \`${
          specifier[depth]
        }\` from \`${specifier.slice(0, depth).join(".")}\``,
      );
    } else if (exportValue.type === "mixin") {
      return { type: "mixin", value: exportValue.value };
    }
    throw new Error(
      `Error unpacking Record/Array - unexpected exportValue "${
        exportValue.type
      }" for specifier "${specifier.join(".")}"`,
    );
  } catch (error) {
    throw new Error(
      `Error resolving from module ${module.filePath}: ${
        (error as Error).message
      }`,
    );
  }
}

type ParsedFile =
  | { type: "regular"; exports: Record<string, ParsedExport>; filePath: string }
  | { type: "yak"; exports: Record<string, ParsedExport>; filePath: string };

type ParsedExport =
  | { type: "styled-component" }
  | { type: "mixin"; value: string }
  | { type: "constant"; value: string | number }
  | { type: "record"; value: Record<any, ParsedExport> | {} }
  | { type: "unsupported" }
  | { type: "re-export"; from: string; imported: string }
  | { type: "star-export"; from: string[] };

type ResolvedExport =
  | { type: "styled-component"; from: string; name: string }
  | { type: "mixin"; value: string | number }
  | { type: "constant"; value: string | number };
