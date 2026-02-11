import { defineConfig } from "tsup";

export default defineConfig([
  // runtime
  {
    entryPoints: ["runtime/index.ts"],
    format: ["cjs", "esm"],
    minify: true,
    sourcemap: true,
    clean: true,
    external: ["react", "next-yak/context"],
    target: "es2022",
    outDir: "dist",
  },
  // runtime types (has to be separate because it includes context types)
  {
    entryPoints: ["runtime/index.ts"],
    format: ["cjs", "esm"],
    dts: {
      only: true,
    },
    external: ["react"],
    target: "es2022",
    outDir: "dist",
  },
  // internal
  {
    entryPoints: ["runtime/internal.ts"],
    format: ["cjs", "esm"],
    minify: false,
    sourcemap: true,
    dts: false,
    external: ["react", "next-yak/context"],
    target: "es2022",
    outDir: "dist",
  },
  // static
  {
    entryPoints: ["static/index.ts"],
    format: ["cjs", "esm"],
    minify: true,
    sourcemap: true,
    clean: true,
    dts: true,
    external: ["react"],
    target: "es2022",
    outDir: "dist/static",
  },
  // baseContext
  {
    entryPoints: ["runtime/context/baseContext.tsx"],
    format: ["cjs", "esm"],
    minify: false,
    sourcemap: true,
    clean: false,
    dts: true,
    external: ["react"],
    target: "es2022",
    outDir: "dist/context",
  },
  // client context
  {
    entryPoints: ["runtime/context/index.tsx"],
    format: ["cjs", "esm"],
    minify: false,
    sourcemap: true,
    clean: false,
    dts: true,
    external: ["react"],
    target: "es2022",
    outDir: "dist/context",
  },
  // server context
  {
    entryPoints: ["runtime/context/index.server.tsx"],
    format: ["cjs", "esm"],
    minify: false,
    sourcemap: true,
    clean: false,
    external: ["react", "next-yak/context/baseContext", "./index.js"],
    target: "es2022",
    outDir: "dist/context",
  },
  // withYak (next.js config plugin)
  {
    entryPoints: ["withYak/index.ts"],
    format: ["cjs", "esm"],
    minify: false,
    sourcemap: true,
    clean: false,
    dts: true,
    target: "es2022",
    outDir: "dist/withYak",
  },
  // isolated-source-eval (main entry)
  {
    entryPoints: ["isolated-source-eval/index.ts"],
    format: ["esm"],
    sourcemap: true,
    clean: false,
    dts: true,
    target: "es2022",
    outDir: "dist/isolated-source-eval",
  },
  // isolated-source-eval worker (loaded at runtime, must be separate file)
  {
    entryPoints: ["isolated-source-eval/worker.ts"],
    format: ["esm"],
    sourcemap: true,
    clean: false,
    dts: false,
    target: "es2022",
    outDir: "dist/isolated-source-eval",
  },
  // loaders
  {
    entryPoints: ["loaders/vite-plugin.ts"],
    format: ["esm"],
    minify: false,
    sourcemap: true,
    clean: false,
    external: [
      // all non relative imports must be load from node_modules
      /^(?!\.)/,
      // isolated-source-eval must not be bundled (worker path would break)
      /\.\.\/isolated-source-eval\//,
    ],
    noExternal: [],
    dts: true,
    platform: "node",
    splitting: false,
    target: "es2022",
    outDir: "dist/loaders",
  },
  {
    entryPoints: ["loaders/webpack-loader.ts", "loaders/turbo-loader.ts"],
    format: ["cjs"],
    minify: false,
    sourcemap: true,
    clean: false,
    external: [
      // all non relative imports must be load from node_modules
      /^(?!\.)/,
      // isolated-source-eval must not be bundled (worker path would break)
      /\.\.\/isolated-source-eval\//,
    ],
    noExternal: [],
    dts: true,
    platform: "node",
    splitting: false,
    target: "es2022",
    outDir: "dist/loaders",
  },
  // jsx-runtime
  {
    entryPoints: ["runtime/jsx-runtime.ts"],
    format: ["cjs", "esm"],
    minify: true,
    sourcemap: true,
    clean: true,
    dts: true,
    external: ["react"],
    target: "es2022",
    outDir: "dist",
  },
  // jsx-runtime-dev
  {
    entryPoints: ["runtime/jsx-dev-runtime.ts"],
    format: ["cjs", "esm"],
    minify: true,
    sourcemap: true,
    clean: true,
    external: ["react"],
    target: "es2022",
    outDir: "dist",
  },
]);
