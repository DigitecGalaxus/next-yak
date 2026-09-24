import cssExtractLoader from "next-yak/loaders/webpack-loader";

/**
 * Runs next-yak's real webpack CSS loader in the browser, against an in-memory file system.
 *
 * The loader reads the yak comments that the SWC plugin leaves in the compiled code and
 * resolves cross-file constants (for example `${colors.violet}` from a `.yak` file) through
 * `loadModule` and `importModule`. This file gives it just those few webpack methods, so the
 * playground shows the same CSS a real build would.
 */
export async function runLoaderForSingleFile(
  originalContent: string,
  transpiledContent: string,
  fileName: string,
  additionalFiles: {
    name: string;
    transpiledContent: string;
    originalContent: string;
  }[] = [],
): Promise<string> {
  const entry = `/src/${fileName}.tsx`;
  const mockLoader = new MockLoaderContext("");
  mockLoader.fs.setFile(entry, originalContent, transpiledContent);

  for (const { name, originalContent, transpiledContent } of additionalFiles) {
    mockLoader.fs.setFile(`/src/./${name}.tsx`, originalContent, transpiledContent);
  }

  mockLoader.resourcePath = entry;

  const p = createAsyncPromise(mockLoader);
  // @ts-expect-error MockLoaderContext only implements the subset of LoaderContext we need
  void cssExtractLoader.call(mockLoader, "", undefined);
  return (await p) as string;
}

function createAsyncPromise(mockLoader: MockLoaderContext) {
  return new Promise((resolve, reject) => {
    mockLoader.async = () => (error: Error | null, result: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    };
  });
}

class MockFileSystem {
  files: Map<string, { content: string; transpiledContent: string }> = new Map();

  setFile(path: string, content: string, transpiledContent: string) {
    this.files.set(path, { content, transpiledContent });
  }

  readFile(
    path: string,
    encoding: string,
    callback: (err: Error | null, result: string | null) => void,
  ) {
    const file = this.files.get(path);
    if (file) {
      callback(null, file.content);
    } else {
      callback(new Error(`File not found: ${path}`), null);
    }
  }
}

class MockLoaderContext {
  private dependencies: Set<string> = new Set();
  public fs: MockFileSystem = new MockFileSystem();
  // the loader keys its parse cache on the compilation and reads `modules` for error details
  public _compilation = { modules: [] };
  public rootContext: string = "/root";
  public resourcePath: string = "";
  public context: string = "/src";

  constructor(
    public transpiledYakFile: string = "",
    public deps: Record<string, unknown> = {},
  ) {}

  async resolve(
    context: string,
    request: string,
    callback: (err: Error | null, result: string | null) => void,
  ) {
    const resolvedPath = `${context}/${request}.tsx`;
    callback(null, resolvedPath);
  }

  async importModule(request: string): Promise<Record<string, unknown>> {
    const file = this.fs.files.get(request);
    const require = (path: string) => {
      if (this.deps[path]) {
        return this.deps[path];
      }
      throw Error(`Module not found: ${path}.`);
    };

    const result = new Function("exports", "require", file?.transpiledContent ?? "");

    const exports: Record<string, unknown> = {};
    result(exports, require);
    return exports;
  }

  loadModule(request: string, callback: (err: Error | null, source: string | null) => void) {
    callback(null, this.fs.files.get(request)?.transpiledContent || null);
  }

  addDependency(dependency: string) {
    this.dependencies.add(dependency);
  }

  getDependencies(): string[] {
    return Array.from(this.dependencies);
  }

  async() {
    return (error: Error | null, result: any) => {
      return result;
    };
  }

  getOptions() {
    return {
      experiments: {
        transpilationMode: "Css",
      },
    };
  }
}
