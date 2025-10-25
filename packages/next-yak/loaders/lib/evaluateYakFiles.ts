import { transformSync } from "@swc/core";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";

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
 * - Only evaluates the entry module (dependencies are loaded lazily via require)
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

  const moduleCache = new Map<string, any>();
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

  // Create require function with pre-resolved imports
  const createRequireWithResolver = (currentPath: string) => {
    const nodeRequire = createRequire(currentPath);
    const resolvedImports = resolvedImportsCache.get(currentPath) || new Map();

    return (specifier: string) => {
      // Check if this was pre-resolved
      const resolvedPath = resolvedImports.get(specifier);

      if (resolvedPath) {
        // Check cache first
        if (moduleCache.has(resolvedPath)) {
          return moduleCache.get(resolvedPath);
        }

        // node_modules - use Node's require
        if (resolvedPath.includes("node_modules")) {
          const result = nodeRequire(resolvedPath);
          moduleCache.set(resolvedPath, result);
          return result;
        }

        // All pre-resolved local files - use transpiled code if available
        const transpiledCode = transpiledCache.get(resolvedPath);

        if (transpiledCode) {
          // File was transpiled, evaluate it
          const moduleExports = {};
          const moduleObj = { exports: moduleExports };

          new Function(
            "exports",
            "module",
            "require",
            "__filename",
            "__dirname",
            transpiledCode,
          )(
            moduleExports,
            moduleObj,
            createRequireWithResolver(resolvedPath),
            resolvedPath,
            dirname(resolvedPath),
          );

          const result = moduleObj.exports || moduleExports;
          moduleCache.set(resolvedPath, result);
          return result;
        }

        // Not transpiled - use Node's require with the resolved path
        const result = nodeRequire(resolvedPath);
        moduleCache.set(resolvedPath, result);
        return result;
      }

      // Not pre-resolved - try Node's require directly (for external packages)
      try {
        return nodeRequire(specifier);
      } catch (err) {
        console.warn(`Could not require "${specifier}":`, err);
        return {};
      }
    };
  };

  // Prepare the entry module and all its dependencies
  await prepareModule(modulePath);

  // Now evaluate only the entry module
  const transpiledCode = transpiledCache.get(modulePath)!;

  const moduleExports = {};
  const moduleScope = {
    exports: moduleExports,
    module: { exports: moduleExports },
    require: createRequireWithResolver(modulePath),
    __filename: modulePath,
    __dirname: dirname(modulePath),
  };

  new Function(
    "exports",
    "module",
    "require",
    "__filename",
    "__dirname",
    transpiledCode,
  )(
    moduleScope.exports,
    moduleScope.module,
    moduleScope.require,
    moduleScope.__filename,
    moduleScope.__dirname,
  );

  return moduleScope.module.exports || moduleScope.exports;
}
