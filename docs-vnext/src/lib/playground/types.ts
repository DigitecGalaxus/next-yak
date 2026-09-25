import type { FrameworkId } from "./frameworks";

/** One editor tab. `name` has no extension: "index", "button", "tokens.yak". */
export type PlaygroundFile = {
  name: string;
  content: string;
};

export type TransformOptions = {
  minify: boolean;
  showComments: boolean;
  foldStatic: boolean;
};

export type TransformedFile = PlaygroundFile & {
  /** CommonJS, run by the preview */
  executable: string;
  js: string;
  jsx: string;
  css: string;
};

export type WorkerResponse =
  | { type: "ready" }
  | { type: "result"; id: number; framework: FrameworkId; files: TransformedFile[] }
  | { type: "error"; id: number; message: string };

export type WorkerRequest = {
  id: number;
  framework: FrameworkId;
  files: PlaygroundFile[];
  options: TransformOptions;
};
