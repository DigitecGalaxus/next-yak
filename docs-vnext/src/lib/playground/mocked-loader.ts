import cssExtractLoader from "next-yak/loaders/webpack-loader";

type LoaderFile = { name: string; content: string; executable: string };
type Callback<T> = (error: Error | null, result: T | null) => void;

/**
 * Runs next-yak's real webpack CSS loader against an in-memory file system, so cross-file
 * constants resolve as in a real build. Only the loader context methods it uses exist.
 */
export function runCssLoader(entry: LoaderFile, others: LoaderFile[]): Promise<string> {
  const resourcePath = `/src/${entry.name}.tsx`;
  const files = new Map(others.map((file) => [`/src/./${file.name}.tsx`, file]));
  files.set(resourcePath, entry);

  return new Promise((resolve, reject) => {
    const context = {
      resourcePath,
      context: "/src",
      // the loader keys its parse cache on the compilation and reads `modules` for error details
      _compilation: { modules: [] },
      fs: {
        readFile(path: string, _encoding: string, callback: Callback<string>) {
          const file = files.get(path);
          if (file) callback(null, file.content);
          else callback(new Error(`File not found: ${path}`), null);
        },
      },
      resolve(dir: string, request: string, callback: Callback<string>) {
        callback(null, `${dir}/${request}.tsx`);
      },
      loadModule(path: string, callback: Callback<string>) {
        callback(null, files.get(path)?.executable || null);
      },
      async importModule(path: string) {
        const exports: Record<string, unknown> = {};
        const require = (request: string) => {
          throw Error(`Module not found: ${request}.`);
        };
        new Function("exports", "require", files.get(path)?.executable ?? "")(exports, require);
        return exports;
      },
      getOptions: () => ({ experiments: { transpilationMode: "Css" } }),
      async: () => (error: Error | null, result: string) => (error ? reject(error) : resolve(result)),
    };
    // @ts-expect-error only the parts of LoaderContext the loader uses
    void cssExtractLoader.call(context, "", undefined);
  });
}
