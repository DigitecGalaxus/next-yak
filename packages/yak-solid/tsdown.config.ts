import { defineConfig, type UserConfig } from "tsdown";

const outExtensions: UserConfig["outExtensions"] = () => ({
  js: ".js",
  dts: ".d.ts",
});

// Strip JSDoc to match esbuild defaults (tsup parity); keep annotation
// comments like `@__PURE__` so downstream tree-shakers can still see them.
const stripJsdoc = { comments: { jsdoc: false } } as const;

// solid-js, @solidjs/web and the aliasable context entry stay external
const runtimeExternals = [/^solid-js($|\/)/, /^@solidjs\//, /^@yak\/solid\/context$/];

export default defineConfig([
  // public API (mocks + types)
  {
    entry: ["runtime/index.ts"],
    format: ["esm"],
    minify: true,
    sourcemap: true,
    clean: true,
    dts: false,
    deps: { neverBundle: runtimeExternals },
    target: "es2022",
    outDir: "dist",
    outExtensions,
    outputOptions: stripJsdoc,
  },
  // public API types: separate build WITHOUT the context external so
  // `YakTheme` (and the useTheme/YakThemeProvider signatures using it) are
  // inlined into dist/index.d.ts as a single declaration - consumers augment
  // it via `declare module "@yak/solid"`. The JS build above keeps the
  // context external so there is exactly one runtime context instance.
  {
    entry: ["runtime/index.ts"],
    format: ["esm"],
    dts: { emitDtsOnly: true },
    deps: { neverBundle: [/^solid-js($|\/)/, /^@solidjs\//] },
    target: "es2022",
    outDir: "dist",
    outExtensions,
  },
  // internal runtime (referenced by compiled code)
  {
    entry: ["runtime/internal.ts"],
    format: ["esm"],
    minify: false,
    sourcemap: true,
    dts: true,
    deps: { neverBundle: runtimeExternals },
    target: "es2022",
    outDir: "dist",
    outExtensions,
    outputOptions: stripJsdoc,
  },
  // theme context (separate entry so the vite plugin can alias baseContext)
  {
    entry: ["runtime/context/index.ts", "runtime/context/baseContext.ts"],
    format: ["esm"],
    minify: false,
    sourcemap: true,
    dts: true,
    deps: { neverBundle: [/^solid-js($|\/)/, /^@solidjs\//, /^@yak\/solid($|\/)/] },
    target: "es2022",
    outDir: "dist/context",
    outExtensions,
    outputOptions: stripJsdoc,
  },
  // vite plugin (node)
  {
    entry: ["loaders/vite-plugin.ts"],
    format: ["esm"],
    minify: false,
    sourcemap: true,
    dts: true,
    platform: "node",
    deps: { neverBundle: [/^next-yak($|\/)/, /^vite($|\/)/, /^node:/] },
    target: "es2022",
    outDir: "dist/loaders",
    outExtensions,
    outputOptions: stripJsdoc,
  },
]);
