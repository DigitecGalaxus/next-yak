import * as InteropWildcard from "@swc/helpers/_/_interop_require_wildcard";
import * as InteropDefault from "@swc/helpers/_/_interop_require_default";
import type { Runtime } from "./runtimes/types";
import type { TransformedFile } from "./types";

const helperModules: Record<string, unknown> = {
  "@swc/helpers/_/_interop_require_wildcard": InteropWildcard,
  "@swc/helpers/_/_interop_require_default": InteropDefault,
};

/** Evaluates the compiled CommonJS files and returns the main file's default export. */
export function runModules(files: TransformedFile[], { modules, packages }: Runtime): unknown {
  const byName = new Map(files.map((file) => [file.name, file]));
  const cache = new Map<string, Record<string, unknown>>();

  const load = (file: TransformedFile) => {
    const cached = cache.get(file.name);
    if (cached) return cached;
    const exports: Record<string, unknown> = {};
    cache.set(file.name, exports);
    new Function("exports", "require", file.executable)(exports, require);
    return exports;
  };

  function require(path: string): unknown {
    if (path in modules) return modules[path];
    if (path in helperModules) return helperModules[path];
    // the preview injects the CSS itself
    if (path.includes(".yak.css!=!")) return {};
    const file = byName.get(path.replace(/^\.\//, ""));
    if (file) return load(file);
    throw new Error(
      `Module not found: ${path}. The playground can import ${packages.join(", ")} and its own files.`,
    );
  }

  return load(files[0]).default;
}
