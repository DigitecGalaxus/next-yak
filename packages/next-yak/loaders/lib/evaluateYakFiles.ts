import { transformSync } from "@swc/core";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { createContext, runInContext } from "node:vm";

interface EvaluateYakModuleOptions {
  modulePath: string;
  yakPluginOptions: any;
  resolve: (specifier: string, fromPath: string) => Promise<string>;
  addDependency: (filePath: string) => void;
}

/**
 * Evaluates a .yak module and all its dependencies
 * - Transpiles all files with yak-swc
 * - Pre-resolves imports using the provided resolver (Turbopack/Webpack)
 * - Bundles all dependencies into a single file and evaluates once
 */
export async function evaluateYakModule({
  modulePath,
  yakPluginOptions,
  resolve,
  addDependency,
}: EvaluateYakModuleOptions): Promise<any> {
  const isYakFile = (path: string) => {
    return /\.yak\.(ts|tsx|js|jsx)$/.test(path);
  };

  if (!isYakFile(modulePath)) {
    return {};
  }

  const transpiledCache = new Map<string, string>();
  const resolvedImportsCache = new Map<string, Map<string, string>>();

  // Extract all import/require specifiers from transpiled code
  const extractImportSpecifiers = (code: string): Set<string> => {
    const specifiers = new Set<string>();

    // Match require() calls: require("specifier") or require('specifier')
    const requireRegex = /require\s*\(\s*["']([^"']+)["']\s*\)/g;
    let match;

    while ((match = requireRegex.exec(code)) !== null) {
      specifiers.add(match[1]);
    }

    return specifiers;
  };

  // Transpile a file with yak-swc and cache the result
  const transpileFile = (filePath: string): string => {
    if (transpiledCache.has(filePath)) {
      return transpiledCache.get(filePath)!;
    }

    addDependency(filePath);

    const code = readFileSync(filePath, "utf-8");

    const transformed = transformSync(code, {
      filename: filePath,
      sourceFileName: filePath,
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

    transpiledCache.set(filePath, transformed.code);
    return transformed.code;
  };

  // Pre-resolve all imports from a file using the provided resolver
  const preResolveImports = async (
    code: string,
    fromPath: string,
  ): Promise<Map<string, string>> => {
    if (resolvedImportsCache.has(fromPath)) {
      return resolvedImportsCache.get(fromPath)!;
    }

    const specifiers = extractImportSpecifiers(code);
    const resolvedMap = new Map<string, string>();

    for (const specifier of specifiers) {
      // Skip external packages - they'll be resolved by Node's require
      if (
        !specifier.startsWith(".") &&
        !specifier.startsWith("/") &&
        !specifier.startsWith("@/")
      ) {
        continue;
      }

      try {
        const resolved = await resolve(specifier, fromPath);
        resolvedMap.set(specifier, resolved);
      } catch (err) {
        console.warn(
          `Could not resolve "${specifier}" from "${fromPath}":`,
          err,
        );
      }
    }

    resolvedImportsCache.set(fromPath, resolvedMap);
    return resolvedMap;
  };

  // Recursively transpile and pre-resolve a file and all its dependencies
  const prepareModule = async (filePath: string): Promise<void> => {
    // Skip if already processed
    if (transpiledCache.has(filePath)) {
      return;
    }

    // Transpile this file with yak-swc
    const transpiledCode = transpileFile(filePath);

    // Pre-resolve its imports
    const resolvedImports = await preResolveImports(transpiledCode, filePath);

    // Recursively prepare any dependencies that need transpilation
    for (const resolvedPath of resolvedImports.values()) {
      // Prepare any file that might need transpilation (not just .yak files)
      // This includes .ts, .tsx, .js, .jsx files that are imported
      if (!resolvedPath.includes("node_modules")) {
        await prepareModule(resolvedPath);
      }
    }
  };

  // Generate a bundled module system with all dependencies
  const generateBundle = (): string => {
    const nodeRequire = createRequire(modulePath);
    const modules: string[] = [];
    const moduleMapping: Record<string, string> = {};

    // Create module IDs for all transpiled modules
    let moduleId = 0;
    for (const [filePath] of transpiledCache) {
      const id = `__yak_module_${moduleId++}`;
      moduleMapping[filePath] = id;
    }

    // Generate wrapped modules
    for (const [filePath, code] of transpiledCache) {
      const resolvedImports = resolvedImportsCache.get(filePath) || new Map();
      const moduleId = moduleMapping[filePath];

      // Transform require calls to use module mapping
      let wrappedCode = code;
      for (const [specifier, resolvedPath] of resolvedImports) {
        if (moduleMapping[resolvedPath]) {
          // Local module - replace with module ID
          wrappedCode = wrappedCode.replace(
            new RegExp(
              `require\\s*\\(\\s*["']${escapeRegex(specifier)}["']\\s*\\)`,
              "g",
            ),
            `__bundleRequire("${moduleMapping[resolvedPath]}")`,
          );
        } else if (resolvedPath.includes("node_modules")) {
          // External module - keep as-is but use resolved path
          wrappedCode = wrappedCode.replace(
            new RegExp(
              `require\\s*\\(\\s*["']${escapeRegex(specifier)}["']\\s*\\)`,
              "g",
            ),
            `__nodeRequire("${resolvedPath}")`,
          );
        } else {
          // Try node require with original specifier for external packages
          wrappedCode = wrappedCode.replace(
            new RegExp(
              `require\\s*\\(\\s*["']${escapeRegex(specifier)}["']\\s*\\)`,
              "g",
            ),
            `__nodeRequire("${specifier}")`,
          );
        }
      }

      modules.push(`
        __modules["${moduleId}"] = function(exports, module, __bundleRequire, __nodeRequire, __filename, __dirname) {
          ${wrappedCode}
        };
      `);
    }

    // Generate the bundle
    return `
      (function() {
        const __modules = {};
        const __moduleCache = {};
        const __nodeRequire = require;

        ${modules.join("\n")}

        function __bundleRequire(moduleId) {
          if (__moduleCache[moduleId]) {
            return __moduleCache[moduleId].exports;
          }

          const module = { exports: {} };
          __moduleCache[moduleId] = module;

          __modules[moduleId](
            module.exports,
            module,
            __bundleRequire,
            __nodeRequire,
            __filename,
            __dirname
          );

          return module.exports;
        }

        // Execute the entry module
        return __bundleRequire("${moduleMapping[modulePath]}");
      })();
    `;
  };

  // Helper function to escape regex special characters
  const escapeRegex = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  // Prepare the entry module and all its dependencies
  await prepareModule(modulePath);

  // Generate the bundled code
  const bundledCode = generateBundle();

  // Create VM context and evaluate the bundle once
  const context = createContext({
    require: createRequire(modulePath),
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
  });

  return runInContext(bundledCode, context);
}
