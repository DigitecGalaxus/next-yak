import * as prettier from "prettier";
import * as typescriptParser from "prettier/plugins/typescript";
import * as estreePlugin from "prettier/plugins/estree";
import { runLoaderForSingleFile } from "./mocked-loader";
import type { transform as WasmTransform } from "./wasm";
import type { PlaygroundFile, TransformOptions, TransformedFile } from "./types";

/**
 * Compiles every playground file the way a real build does: SWC with the yak plugin (the
 * WASM build of packages/yak-swc), then next-yak's CSS loader for the extracted CSS.
 *
 * Each file compiles three times. The CommonJS copy is the one the preview runs. The two
 * ES module copies, formatted with prettier, are the ones the output panel shows: one with
 * the JSX compiled (what a bundler gets) and one with the JSX kept, so the yak transform
 * is easy to compare with the source.
 *
 * All files compile before any CSS resolves, so a file can take constants from any other
 * file, in any tab order.
 */
export async function transformAll(
  wasmTransform: typeof WasmTransform,
  files: PlaygroundFile[],
  options: TransformOptions,
): Promise<TransformedFile[]> {
  const compiled = await Promise.all(files.map((file) => compileFile(wasmTransform, file, options)));

  return Promise.all(
    compiled.map(async (file) => ({
      ...file,
      css: await runLoaderForSingleFile(
        file.content,
        file.executable,
        file.name,
        compiled
          .filter((other) => other !== file)
          .map((other) => ({
            name: other.name,
            originalContent: other.content,
            transpiledContent: other.executable,
          })),
      ),
    })),
  );
}

async function compileFile(
  wasmTransform: typeof WasmTransform,
  file: PlaygroundFile,
  options: TransformOptions,
): Promise<Omit<TransformedFile, "css">> {
  try {
    const executable = runSwc(wasmTransform, file, options, { output: "commonjs" });
    const [js, jsx] = await Promise.all(
      (["js", "jsx"] as const).map((output) =>
        prettier.format(runSwc(wasmTransform, file, options, { output }), {
          parser: "typescript",
          plugins: [typescriptParser, estreePlugin],
        }),
      ),
    );
    return { ...file, executable, js, jsx };
  } catch (error) {
    // SWC reports a multi-line diagnostic. Its first line names the problem.
    if (typeof error === "string") {
      throw new Error(`${error.split("\n")[0].replace("x ", "").trim()} in ${file.name}.tsx`);
    }
    throw error;
  }
}

function runSwc(
  wasmTransform: typeof WasmTransform,
  file: PlaygroundFile,
  options: TransformOptions,
  { output }: { output: "commonjs" | "js" | "jsx" },
): string {
  const commonjs = output === "commonjs";
  return wasmTransform(
    file.content,
    {
      filename: `${file.name}.tsx`,
      jsc: {
        target: "es2022",
        loose: false,
        minify: { compress: false, mangle: false },
        // the preview needs the yak comments for the CSS loader, the display copy may hide them
        preserveAllComments: commonjs || options.showComments,
        transform: {
          // "preserve" still runs the yak transform, it only leaves the JSX as it is
          react: { runtime: output === "jsx" ? "preserve" : "automatic", importSource: "next-yak" },
        },
      },
      ...(commonjs ? { module: { type: "commonjs" } } : {}),
      // keep the JSX calls readable: only class names are minified, by the yak option below
      minify: false,
    },
    {
      // short hashed class names and no display names, as in a production build
      minify: options.minify,
      foldStatic: options.foldStatic,
    },
  ).code;
}
