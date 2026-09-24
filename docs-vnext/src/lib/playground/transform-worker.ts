import * as prettier from "prettier";
import * as typescriptParser from "prettier/plugins/typescript";
import * as estreePlugin from "prettier/plugins/estree";
import init, { start, transform } from "./wasm";
import { runCssLoader } from "./mocked-loader";
import type {
  PlaygroundFile,
  TransformOptions,
  TransformedFile,
  WorkerRequest,
  WorkerResponse,
} from "./types";

const post = (message: WorkerResponse) => self.postMessage(message);

// the explicit URL makes the bundler copy the WASM file next to the worker, under the base path
const ready = init({ module_or_path: new URL("./wasm/index_bg.wasm", import.meta.url) }).then(
  () => {
    start();
    post({ type: "ready" });
  },
);

self.addEventListener("message", async (event: MessageEvent<WorkerRequest>) => {
  const { id, files, options } = event.data;
  await ready;
  try {
    post({ type: "result", id, files: await transformAll(files, options) });
  } catch (error) {
    post({ type: "error", id, message: error instanceof Error ? error.message : String(error) });
  }
});

/**
 * Each file compiles three times: CommonJS for the preview to run, and two formatted ES
 * modules for the output panel, one with the JSX compiled and one with it kept.
 * All files compile before any CSS resolves, so a file can take constants from any other.
 */
async function transformAll(
  files: PlaygroundFile[],
  options: TransformOptions,
): Promise<TransformedFile[]> {
  const compiled = await Promise.all(files.map((file) => compileFile(file, options)));
  return Promise.all(
    compiled.map(async (file) => ({
      ...file,
      css: await runCssLoader(file, compiled.filter((other) => other !== file)),
    })),
  );
}

async function compileFile(
  file: PlaygroundFile,
  options: TransformOptions,
): Promise<Omit<TransformedFile, "css">> {
  try {
    const executable = runSwc(file, options, "commonjs");
    const [js, jsx] = await Promise.all(
      (["js", "jsx"] as const).map((output) =>
        prettier.format(runSwc(file, options, output), {
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
  file: PlaygroundFile,
  options: TransformOptions,
  output: "commonjs" | "js" | "jsx",
): string {
  const commonjs = output === "commonjs";
  return transform(
    file.content,
    {
      filename: `${file.name}.tsx`,
      jsc: {
        target: "es2022",
        loose: false,
        minify: { compress: false, mangle: false },
        // the CSS loader needs the yak comments in the CommonJS copy
        preserveAllComments: commonjs || options.showComments,
        transform: {
          // "preserve" still runs the yak transform, it only leaves the JSX as it is
          react: { runtime: output === "jsx" ? "preserve" : "automatic", importSource: "next-yak" },
        },
      },
      ...(commonjs ? { module: { type: "commonjs" } } : {}),
      // only class names are minified, by the yak option below
      minify: false,
    },
    {
      minify: options.minify,
      foldStatic: options.foldStatic,
    },
  ).code;
}
