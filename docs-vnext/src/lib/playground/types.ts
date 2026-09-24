/** One editor tab. `name` has no extension: "index", "button", "tokens.yak". */
export type PlaygroundFile = {
  name: string;
  content: string;
};

export type TransformOptions = {
  /** hashed class names and no display names, as in a production build */
  minify: boolean;
  /** keep comments in the displayed output */
  showComments: boolean;
  /** fold static styled components into plain elements */
  foldStatic: boolean;
};

export type TransformedFile = PlaygroundFile & {
  /** CommonJS, run by the preview */
  executable: string;
  /** formatted ES module with the JSX compiled, shown in the JS tab */
  js: string;
  /** formatted ES module with the JSX kept, shown in the JSX tab */
  jsx: string;
  css: string;
};

/** What the worker sends back: the compiled files, or the first error. */
export type WorkerResponse =
  | { type: "ready" }
  | { type: "result"; id: number; files: TransformedFile[] }
  | { type: "error"; id: number; message: string };

export type WorkerRequest = {
  id: number;
  files: PlaygroundFile[];
  options: TransformOptions;
};
