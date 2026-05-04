import { defineConfig, type UserConfig } from "tsdown";

const outExtensions: UserConfig["outExtensions"] = ({ format }) => ({
  js: format === "cjs" ? ".cjs" : ".js",
  dts: format === "cjs" ? ".d.cts" : ".d.ts",
});

// Strip JSDoc to match esbuild defaults (tsup parity); keep annotation
// comments like `@__PURE__` so downstream tree-shakers can still see them.
const stripJsdoc = { comments: { jsdoc: false } } as const;

export default defineConfig([
  // runtime
  {
    entry: ["runtime/index.ts"],
    format: ["cjs", "esm"],
    minify: true,
    sourcemap: true,
    clean: true,
    dts: true,
    deps: { neverBundle: [/^react($|\/)/, /^next-yak\/context$/] },
    target: "es2022",
    outDir: "dist",
    outExtensions,
    outputOptions: stripJsdoc,
  },
  // internal
  {
    entry: ["runtime/internal.ts"],
    format: ["cjs", "esm"],
    minify: false,
    sourcemap: true,
    dts: true,
    deps: { neverBundle: [/^react($|\/)/, /^next-yak\/context$/] },
    target: "es2022",
    outDir: "dist",
    outExtensions,
    outputOptions: stripJsdoc,
  },
  // static
  {
    entry: ["static/index.ts"],
    format: ["cjs", "esm"],
    minify: true,
    sourcemap: true,
    clean: true,
    dts: true,
    deps: { neverBundle: [/^react($|\/)/] },
    outputOptions: { ...stripJsdoc, codeSplitting: false },
    target: "es2022",
    outDir: "dist/static",
    outExtensions,
  },
  // baseContext
  {
    entry: ["runtime/context/baseContext.tsx"],
    format: ["cjs", "esm"],
    minify: false,
    sourcemap: true,
    clean: false,
    dts: true,
    deps: { neverBundle: [/^react($|\/)/, "next-yak"] },
    target: "es2022",
    outDir: "dist/context",
    outExtensions,
    outputOptions: stripJsdoc,
  },
  // client context
  {
    entry: ["runtime/context/index.tsx"],
    format: ["cjs", "esm"],
    minify: false,
    sourcemap: true,
    clean: false,
    dts: true,
    deps: { neverBundle: [/^react($|\/)/] },
    target: "es2022",
    outDir: "dist/context",
    outExtensions,
    outputOptions: stripJsdoc,
  },
  // server context
  {
    entry: ["runtime/context/index.server.tsx"],
    format: ["cjs", "esm"],
    minify: false,
    sourcemap: true,
    clean: false,
    dts: true,
    deps: {
      neverBundle: [/^react($|\/)/, "next-yak/context/baseContext", "./index.js"],
    },
    target: "es2022",
    outDir: "dist/context",
    outExtensions,
    outputOptions: stripJsdoc,
  },
  // withYak (next.js config plugin)
  {
    entry: ["withYak/index.ts"],
    format: ["cjs", "esm"],
    minify: false,
    sourcemap: true,
    clean: false,
    dts: true,
    target: "es2022",
    outDir: "dist/withYak",
    outExtensions,
    outputOptions: stripJsdoc,
  },
  // isolated-source-eval (main entry)
  {
    entry: ["isolated-source-eval/index.ts"],
    format: ["esm"],
    sourcemap: true,
    clean: false,
    dts: true,
    target: "es2022",
    outDir: "dist/isolated-source-eval",
    outExtensions,
    outputOptions: stripJsdoc,
  },
  // isolated-source-eval worker (loaded at runtime, must be separate file)
  {
    entry: ["isolated-source-eval/worker.ts"],
    format: ["esm"],
    sourcemap: true,
    clean: false,
    dts: false,
    target: "es2022",
    outDir: "dist/isolated-source-eval",
    outExtensions,
    outputOptions: stripJsdoc,
  },
  // loaders
  {
    entry: ["loaders/vite-plugin.ts"],
    format: ["esm"],
    minify: false,
    sourcemap: true,
    clean: false,
    deps: {
      neverBundle: [
        // all non-relative (package) imports stay external
        /^[@a-zA-Z]/,
        // node built-ins
        /^node:/,
        // isolated-source-eval must not be bundled (worker path would break)
        /\.\.\/isolated-source-eval\//,
        // withYak is shipped as its own entry. Keep its types as re-imports
        // in the loader `.d.ts` rather than inlining them
        /\.\.\/withYak\//,
      ],
    },
    outputOptions: { ...stripJsdoc, codeSplitting: false },
    dts: true,
    platform: "node",
    target: "es2022",
    outDir: "dist/loaders",
    outExtensions,
  },
  // webpack-loader and turbo-loader each need to be a self-contained CJS
  // file (Next.js loads them by path, no sibling chunks), so they're built
  // separately with codeSplitting disabled.
  ...["loaders/webpack-loader.ts", "loaders/turbo-loader.ts"].map(
    (loaderEntry): UserConfig => ({
      entry: [loaderEntry],
      format: ["cjs"],
      minify: false,
      sourcemap: true,
      clean: false,
      deps: {
        neverBundle: [
          // all non-relative (package) imports stay external
          /^[@a-zA-Z]/,
          // node built-ins
          /^node:/,
          // isolated-source-eval must not be bundled (worker path would break)
          /\.\.\/isolated-source-eval\//,
          // withYak is shipped as its own entry. Keep its types as re-imports
          // in the loader `.d.ts` rather than inlining them
          /\.\.\/withYak\//,
        ],
      },
      outputOptions: { ...stripJsdoc, codeSplitting: false },
      dts: true,
      platform: "node",
      target: "es2022",
      outDir: "dist/loaders",
      outExtensions,
    }),
  ),
  // jsx-runtime
  {
    entry: ["runtime/jsx-runtime.ts"],
    format: ["cjs", "esm"],
    minify: true,
    sourcemap: true,
    clean: true,
    dts: true,
    deps: { neverBundle: [/^react($|\/)/] },
    target: "es2022",
    outDir: "dist",
    outExtensions,
    outputOptions: stripJsdoc,
  },
  // jsx-runtime-dev
  {
    entry: ["runtime/jsx-dev-runtime.ts"],
    format: ["cjs", "esm"],
    minify: true,
    sourcemap: true,
    clean: true,
    dts: true,
    deps: { neverBundle: [/^react($|\/)/] },
    target: "es2022",
    outDir: "dist",
    outExtensions,
    outputOptions: stripJsdoc,
  },
]);
