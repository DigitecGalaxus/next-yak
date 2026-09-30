import type { Compilation, LoaderContext } from "webpack";
import {
  ParseContext,
  ParsedModule,
  parseModule,
} from "yak-internals/cross-file-resolver/parse-module";
import {
  ResolveContext,
  resolveCrossFileConstant as genericResolveCrossFileConstant,
} from "yak-internals/cross-file-resolver/resolve";
import { parseExports } from "yak-internals/parse-exports";
import { YakConfigOptions } from "yak-internals/config";

export { parseExports };

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
