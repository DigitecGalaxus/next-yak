import type { ComponentType } from "react";
import * as React from "react";
import * as ReactJsxRuntime from "react/jsx-runtime";
import * as NextYak from "next-yak";
import * as NextYakInternal from "next-yak/internal";
import * as NextYakJsxRuntime from "next-yak/jsx-runtime";
import * as InteropWildcard from "@swc/helpers/_/_interop_require_wildcard";
import * as InteropDefault from "@swc/helpers/_/_interop_require_default";
import type { TransformedFile } from "./types";

/**
 * The modules a playground file may import. `@yak/react` is the new name of `next-yak`, so
 * both names point at the same runtime. The yak plugin rewrites `styled` and `css` imports
 * to the `/internal` entry, and the automatic JSX runtime imports `next-yak/jsx-runtime`.
 */
const runtimeModules: Record<string, unknown> = {
  react: React,
  "react/jsx-runtime": ReactJsxRuntime,
  "next-yak": NextYak,
  "next-yak/internal": NextYakInternal,
  "next-yak/jsx-runtime": NextYakJsxRuntime,
  "@yak/react": NextYak,
  "@yak/react/internal": NextYakInternal,
  "@yak/react/jsx-runtime": NextYakJsxRuntime,
  "@swc/helpers/_/_interop_require_wildcard": InteropWildcard,
  "@swc/helpers/_/_interop_require_default": InteropDefault,
};

/**
 * Evaluates the compiled CommonJS files and returns the main file's default export.
 *
 * A file imports another by `./name`. Files evaluate on their first import and then come
 * from the cache, so the order of the tabs does not matter. The CSS import that the yak
 * plugin adds to each file resolves to an empty module: the preview adds the CSS itself.
 */
export function runModules(files: TransformedFile[]): ComponentType | null {
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
    if (path in runtimeModules) return runtimeModules[path];
    if (path.includes(".yak.css!=!")) return {};
    const file = byName.get(path.replace(/^\.\//, ""));
    if (file) return load(file);
    throw new Error(
      `Module not found: ${path}. The playground can import react, @yak/react and its own files.`,
    );
  }

  const exported = load(files[0]).default;
  if (typeof exported === "function") return exported as ComponentType;
  if (React.isValidElement(exported)) return () => exported;
  return null;
}
