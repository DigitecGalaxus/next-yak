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
  const { id, framework, files, options } = event.data;
  await ready;
  try {
    const compile = framework === "solid" ? await solidCompiler() : compileReact;
    post({ type: "result", id, framework, files: await transformAll(files, options, compile) });
  } catch (error) {
    post({ type: "error", id, message: error instanceof Error ? error.message : String(error) });
  }
});

type Compiled = Pick<TransformedFile, "executable" | "js" | "jsx">;
type Compile = (file: PlaygroundFile, options: TransformOptions) => Compiled;

/**
 * Each file compiles three times: CommonJS for the preview to run, and two ES modules for
 * the output panel, one with the JSX compiled and one with it kept.
 * All files compile before any CSS resolves, so a file can take constants from any other.
 */
async function transformAll(
  files: PlaygroundFile[],
  options: TransformOptions,
  compile: Compile,
): Promise<TransformedFile[]> {
  const compiled = await Promise.all(files.map((file) => compileFile(file, options, compile)));
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
  compile: Compile,
): Promise<Omit<TransformedFile, "css">> {
  try {
    const { executable, js, jsx } = compile(file, options);
    const [prettyJs, prettyJsx] = await Promise.all([js, jsx].map(formatCode));
    return { ...file, executable, js: prettyJs, jsx: prettyJsx };
  } catch (error) {
    // SWC and Babel report a multi-line diagnostic. Its first line names the problem.
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${message.split("\n")[0].replace("x ", "").trim()} in ${file.name}.tsx`);
  }
}

const formatCode = (code: string) =>
  prettier.format(code, { parser: "typescript", plugins: [typescriptParser, estreePlugin] });

/** React: SWC compiles the JSX itself, with yak's JSX runtime for the css prop. */
const compileReact: Compile = (file, options) => ({
  executable: runSwc(file, options, { jsx: "automatic", commonjs: true, comments: true }),
  js: runSwc(file, options, { jsx: "automatic", commonjs: false }),
  jsx: runSwc(file, options, { jsx: "preserve", commonjs: false }),
});

/** Solid: SWC runs yak and keeps the JSX, then Solid's compiler turns the JSX into DOM code. */
let solidPromise: Promise<Compile> | null = null;
function solidCompiler(): Promise<Compile> {
  // Babel is large, so a React-only visit never loads it
  solidPromise ??= import("./solid-compiler").then(({ compileSolidJsx }) => (file, options) => {
    const filename = `${file.name}.tsx`;
    const jsx = runSwc(file, options, { jsx: "preserve", commonjs: false });
    const withComments = runSwc(file, options, { jsx: "preserve", commonjs: false, comments: true });
    return {
      executable: compileSolidJsx(withComments, filename, true),
      js: compileSolidJsx(jsx, filename, false),
      jsx,
    };
  });
  return solidPromise;
}

function runSwc(
  file: PlaygroundFile,
  options: TransformOptions,
  output: { jsx: "automatic" | "preserve"; commonjs: boolean; comments?: boolean },
): string {
  return transform(
    file.content,
    {
      filename: `${file.name}.tsx`,
      jsc: {
        target: "es2022",
        loose: false,
        minify: { compress: false, mangle: false },
        // the CSS loader needs the yak comments in the CommonJS copy
        preserveAllComments: output.comments || options.showComments,
        transform: {
          // "preserve" still runs the yak transform, it only leaves the JSX as it is
          react: { runtime: output.jsx, importSource: "next-yak" },
        },
      },
      ...(output.commonjs ? { module: { type: "commonjs" } } : {}),
      // only class names are minified, by the yak option below
      minify: false,
    },
    {
      minify: options.minify,
      foldStatic: options.foldStatic,
    },
  ).code;
}
