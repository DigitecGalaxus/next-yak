import { type JscConfig, Options, transform as swcTransform } from "@swc/core";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, dirname, extname, resolve } from "node:path";
import { isFileLoadingAllowed, normalizePath, type Plugin, type ResolvedConfig } from "vite";
import { parseModule } from "../cross-file-resolver/parseModule.js";
import { resolveCrossFileConstant } from "../cross-file-resolver/resolveCrossFileConstant.js";
import { createEvaluator, type Evaluator } from "yak-internals/isolated-source-eval";
import { resolveYakContext, YakConfigOptions } from "../config.js";
import { createDebugLogger } from "./lib/debugLogger.js";
import { extractCss } from "./lib/extractCss.js";
import { parseExports } from "./lib/parseExports.js";
import { getSwcParserOptions } from "./lib/swcParserOptions.js";
const require = createRequire(import.meta.url);

export type ViteYakPluginOptions = YakConfigOptions & {
  /**
   * Base path for the file paths yak-swc turns into stable class names and
   * shows in debug output. Relative paths are resolved from Vite's project root.
   * @defaultValue Vite's resolved `root`
   */
  basePath?: string;
  /**
   * Overrides for the SWC pass which runs the yak transform.
   */
  swcOptions?: SwcOverrides;
};

/**
 * Everything of the SWC options which is not owned by the yak transform
 * (current file being compiled and plugins can't be overridden)
 */
type SwcOverrides = Omit<
  Options,
  "filename" | "sourceFileName" | "inputSourceMap" | "sourceMaps" | "sourceRoot" | "jsc"
> & {
  jsc?: Omit<JscConfig, "experimental"> & {
    experimental?: Omit<NonNullable<JscConfig["experimental"]>, "plugins">;
  };
};

/**
 * @internal Describes a yak runtime package (e.g. "@yak/react", "@yak/solid").
 * The yak-swc compiler detects the package from the import source on its own.
 * This only controls the vite-plugin side (filtering, context alias, HMR).
 * Not part of the public API
 */
export type YakViteLibrary = {
  /** Package name users import from (must be one of the packages known to yak-swc) */
  name: string;
  /**
   * Register components with $RefreshReg$ for React Fast Refresh in dev mode.
   * Disable for runtimes where another plugin owns HMR (e.g. @solidjs/vite-plugin).
   */
  reactRefreshReg: boolean;
  /** Transform-filter exclusion for the runtime package itself */
  excludePattern: RegExp;
  /**
   * Fold statically known styles at build time: JSX usages of fully static
   * styled components become plain DOM elements, and a static `css` prop
   * becomes a plain `className`. Both skip the runtime wrapper and merge calls.
   * @defaultValue true
   */
  foldStatic: boolean;
};

const defaultSwcOptions: ViteYakPluginOptions["swcOptions"] = {
  jsc: {
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
};

/**
 * @internal Creates the vite plugin function for a yak runtime package.
 * @yak/react and @yak/solid each wrap it with their own library config and
 * export the result as their public vite plugin.
 */
export function createViteYakPlugin(library: YakViteLibrary) {
  return async function viteYakPlugin(userOptions: ViteYakPluginOptions = {}): Promise<Plugin> {
    return viteYakImpl(library, userOptions);
  };
}

async function viteYakImpl(
  library: YakViteLibrary,
  userOptions: ViteYakPluginOptions,
): Promise<Plugin> {
  const yakOptions: ViteYakPluginOptions = {
    debug: userOptions.debug,
    minify: userOptions.minify ?? process.env.NODE_ENV === "production",
    prefix: userOptions.prefix,
    foldStatic: userOptions.foldStatic ?? library.foldStatic,
    strictCssProp: userOptions.strictCssProp,
    contextPath: userOptions.contextPath,
    swcOptions: deepMerge(defaultSwcOptions!, userOptions.swcOptions ?? {}),
  };
  yakOptions.displayNames =
    userOptions.displayNames ?? yakOptions.displayNames ?? !yakOptions.minify;
  let basePath = userOptions.basePath ?? "";
  let debugLog: ReturnType<typeof createDebugLogger> = () => {};
  let isServe = false;
  const sourceFileRegex = /\.(tsx?|m?jsx?)\??/;
  // "/src/a.tsx.yak.css" or "/src/a.tsx.yak.css?direct", see resolveId
  const yakCssRegex = /\.yak\.css(?:\?|$)/;
  const yakSwcPath = await findYakSwcPlugin();
  const evaluator: Evaluator = await createEvaluator();

  function checkFileAccess(filePath: string, config: ResolvedConfig): string {
    if (config.command !== "serve") return filePath;

    const normalizedPath = normalizePath(resolve(filePath));
    if (!isFileLoadingAllowed(config, normalizedPath)) {
      throw new Error(`[${library.name}] Access to yak CSS source is denied`);
    }

    return normalizedPath;
  }

  return {
    name: "vite-plugin-yak:css:pre",
    enforce: "pre",
    config: (config) => {
      const context = resolveYakContext(yakOptions.contextPath, config.root ?? process.cwd());

      if (!context) {
        return;
      }

      config.resolve ||= {};

      if (Array.isArray(config.resolve.alias)) {
        config.resolve.alias.push({
          find: `${library.name}/context/baseContext`,
          replacement: context,
        });
      } else {
        config.resolve.alias = {
          ...config.resolve.alias,
          [`${library.name}/context/baseContext`]: context,
        };
      }
    },
    configResolved(config) {
      basePath = basePath ? resolve(config.root, basePath) : config.root;
      debugLog = createDebugLogger(yakOptions.debug, basePath);
      isServe = config.command === "serve";
    },
    // The css of "/src/a.tsx" is the module "/src/a.tsx.yak.css": the source path
    // plus a suffix, not a "\0virtual:" id.
    //
    // Vite and Rolldown recommend a "\0" prefix for virtual modules, but not for
    // modules derived from a real file, like the parts of a Vue or Svelte single file
    // component. yak css is such a module, and a "\0" id breaks it in two ways:
    // - Vite resolves a relative url("./icon.svg") from the directory of the css
    //   module, and a "\0" id has no directory.
    // - SSR frameworks load each stylesheet with a <link> in dev. The css hot update
    //   for such a stylesheet only finds the new url when the id starts with "/".
    // https://vite.dev/guide/api-plugin#virtual-modules-convention
    // https://rolldown.rs/apis/plugin-api#virtual-modules
    //
    // The suffix follows the whole file name. A query would not work: Vite's TS
    // transform ignores the query of "/src/a.tsx?yak&lang.css" and parses the css as TSX.
    resolveId: {
      filter: {
        id: yakCssRegex,
      },
      async handler(id, importer) {
        const { path, query } = splitYakCssId(id);
        // yak-swc imports the css from the source file as "./a.yak.css", because
        // {{__BASE_NAME__}} has no extension. The importer names the source file.
        if (importer && path.startsWith("./")) {
          const source = importer.split("?")[0];
          if (path === `./${basename(source, extname(source))}`) {
            return source + ".yak.css" + query;
          }
        }
        // A request from the browser. Vite serves a file inside the root from the
        // root: "/src/a.tsx.yak.css". For a file outside the root, like a component
        // of a linked package in a monorepo, Vite's import analysis writes the url
        // as "/@fs/" plus the absolute path: "/@fs/home/me/ui/a.tsx.yak.css".
        // this.resolve turns both back into the file path.
        const resolved = await this.resolve(path, importer, { skipSelf: true });
        return resolved && !resolved.external ? resolved.id + ".yak.css" + query : null;
      },
    },
    load: {
      filter: {
        id: yakCssRegex,
      },
      async handler(id) {
        const config = this.environment.getTopLevelConfig();
        const { path: originalId, query: queryString } = splitYakCssId(id);
        if (!originalId) {
          this.error(`[${library.name}] Invalid yak CSS module`);
        }
        // Dev requests can choose any path, so checkFileAccess prevents
        // unrestricted reads by enforcing Vite's file access rules before reading.
        const readSource = async (filePath: string) =>
          this.fs.readFile(checkFileAccess(filePath, config), { encoding: "utf8" });
        const sourceContent = await readSource(originalId);
        this.addWatchFile(originalId);
        const code = await transform(sourceContent, originalId, basePath, yakSwcPath, yakOptions);
        debugLog("ts", code.code, originalId);
        const extractedCss = extractCss(code.code);
        debugLog("css", extractedCss, originalId);

        const { resolved } = await resolveCrossFileConstant(
          {
            parse: (modulePath) => {
              return parseModule(
                {
                  extractExports: async (modulePath) => {
                    const sourceContent = await readSource(modulePath);

                    this.addWatchFile(modulePath);

                    return parseExports(sourceContent);
                  },
                  getTransformed: async (modulePath) => {
                    const sourceContent = await readSource(modulePath);
                    return transform(sourceContent, modulePath, basePath, yakSwcPath, yakOptions);
                  },
                  evaluateYakModule: async (modulePath: string) => {
                    checkFileAccess(modulePath, config);
                    this.addWatchFile(modulePath);
                    const result = await evaluator.evaluate(modulePath);
                    if (!result.ok) {
                      throw new Error(result.error.message);
                    }
                    for (const dep of result.dependencies) {
                      this.addWatchFile(dep);
                    }
                    return result.value;
                  },
                },
                modulePath,
              );
            },
            resolve: async (moduleSpecifier: string, context: string) => {
              let importer = context;
              const resolved = await this.resolve(moduleSpecifier, importer);

              if (!resolved) {
                throw new Error(`Could not resolve ${moduleSpecifier} from ${context}`);
              }
              return resolved.id;
            },
          },
          originalId + queryString,
          extractedCss,
        );

        debugLog("css-resolved", resolved, originalId);
        return resolved;
      },
    },

    configureServer(server) {
      server.watcher.on("change", (file) => {
        evaluator.invalidate(file);
      });
    },

    transform: {
      filter: {
        id: {
          include: sourceFileRegex,
          exclude: [library.excludePattern, yakCssRegex],
        },
        code: library.name,
      },
      async handler(code, id) {
        try {
          const filePath = id.split("?")[0];
          const result = await transform(
            code,
            filePath,
            basePath,
            yakSwcPath,
            yakOptions,
            isServe && library.reactRefreshReg,
            // The bundled/served JS needs no CSS comments. The handler transforms again with preserved CSS comments
            false,
          );

          return {
            code: result.code,
            map: result.map,
          };
        } catch (error) {
          this.error(`[YAK Plugin] Error transforming ${id}: ${(error as Error).message}`);
        }
      },
    },

    // Vite's default HMR only updates the JS module when a source file changes.
    // The extracted CSS lives in a separate module (/src/a.tsx.yak.css)
    // which Vite doesn't know is derived from the source file. Without explicit
    // invalidation here, the browser keeps stale CSS after edits.
    //
    // One css file can be two modules: "/src/a.tsx.yak.css" for the import from
    // a.tsx, and "/src/a.tsx.yak.css?direct" for a <link> an SSR framework renders.
    // Vite sends a js-update for the first and a css-update, which swaps the
    // <link>, for the second, so both go into the update.
    //
    // The edited file is either the source of a css file (a.tsx -> a.tsx.yak.css)
    // or a file a css file imports a value from. The css load watches those
    // files, so the css modules are among the importers of the edited modules.
    hotUpdate({ modules, file, type }) {
      if (type !== "update" && type !== "create") return;
      if (!sourceFileRegex.test(file) || yakCssRegex.test(file)) return;

      const { moduleGraph } = this.environment;
      const cssFiles = new Set([normalizePath(file) + ".yak.css"]);
      for (const mod of modules) {
        for (const importer of mod.importers) {
          if (importer.file && yakCssRegex.test(importer.file)) cssFiles.add(importer.file);
        }
      }
      const cssModules = new Set(
        [...cssFiles].flatMap((cssFile) => [...(moduleGraph.getModulesByFile(cssFile) ?? [])]),
      );
      if (cssModules.size) {
        for (const mod of cssModules) moduleGraph.invalidateModule(mod);
        return [...new Set([...modules, ...cssModules])];
      }
    },
  };
}

/**
 * Splits a yak css id into the source path and the query:
 * "/src/a.tsx.yak.css?direct" -> { path: "/src/a.tsx", query: "?direct" }
 */
function splitYakCssId(id: string) {
  const queryStart = id.indexOf("?");
  const query = queryStart === -1 ? "" : id.slice(queryStart);
  const path = id.slice(0, id.length - query.length).slice(0, -".yak.css".length);
  return { path, query };
}

/**
 * This function finds the path to the yak-swc plugin because it is most of the time a transitive dependency
 * and the resolver of SWC only resolves the main node_modules directory.
 * @returns The path to the yak-swc wasm plugin.
 */
async function findYakSwcPlugin() {
  try {
    const packageJsonPath = require.resolve("@yak/swc/package.json");
    const packageRoot = dirname(packageJsonPath);

    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

    // Resolve the main field which points to the WASM file
    const wasmPath = resolve(packageRoot, packageJson.main);

    return wasmPath;
  } catch (e) {
    throw new Error(`Could not resolve yak-swc plugin: ${e}`);
  }
}

function transform(
  data: string,
  modulePath: string,
  rootPath: string,
  yakSwcPath: string,
  yakOptions: ViteYakPluginOptions,
  reactRefreshReg?: boolean,
  emitCssComments?: boolean,
) {
  // https://github.com/vercel/next.js/blob/canary/packages/next/src/build/webpack/loaders/next-swc-loader.ts#L143
  return swcTransform(data, {
    filename: modulePath,
    inputSourceMap: undefined,
    sourceMaps: true,
    sourceFileName: modulePath,
    sourceRoot: rootPath,
    ...yakOptions.swcOptions,
    jsc: {
      // Derive the parser from the file name, unless the user configured one
      parser: getSwcParserOptions(modulePath),
      ...yakOptions.swcOptions?.jsc,
      experimental: {
        // Keep `import data from "./data.json" with { type: "json" }` intact
        keepImportAttributes: true,
        ...yakOptions.swcOptions?.jsc?.experimental,
        plugins: [
          [
            yakSwcPath,
            {
              minify: yakOptions.minify,
              basePath: rootPath,
              prefix: yakOptions.prefix,
              displayNames: yakOptions.displayNames,
              foldStatic: yakOptions.foldStatic ?? true,
              strictCssProp: yakOptions.strictCssProp ?? true,
              ...(reactRefreshReg ? { reactRefreshReg: true } : {}),
              ...(emitCssComments === false ? { emitCssComments: false } : {}),
              importMode: {
                value: "./{{__BASE_NAME__}}.yak.css",
                encoding: "None",
              },
            },
          ],
        ],
      },
    },
  });
}

/**
 * Deep merge two objects, with source values overriding target values.
 */
function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key of Object.keys(source) as Array<keyof T>) {
    const sourceValue = source[key];
    const targetValue = target[key];
    if (
      sourceValue !== undefined &&
      typeof sourceValue === "object" &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === "object" &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
      ) as T[keyof T];
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[keyof T];
    }
  }
  return result;
}
