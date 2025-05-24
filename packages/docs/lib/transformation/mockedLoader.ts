import { type Compilation } from "webpack";
// @ts-ignore
import cssLoader = require("next-yak/loaders/css-loader");

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
    mockLoader.fs.setFile(
      `/src/./${name}.tsx`,
      originalContent,
      transpiledContent,
    );
  }

  mockLoader.resourcePath = entry;

  const p = createAsyncPromise(mockLoader);
  // @ts-expect-error Types don't add up
  cssLoader.default.call(mockLoader, "", undefined);
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
  files: Map<string, { content: string; transpiledContent: string }> =
    new Map();

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

class MockCompilation implements Partial<Compilation> {
  // Add any necessary Compilation properties or methods here
}

class MockLoaderContext {
  private dependencies: Set<string> = new Set();
  public fs: MockFileSystem = new MockFileSystem();
  public _compilation: MockCompilation = new MockCompilation();
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

    const result = new Function(
      "exports",
      "require",
      file?.transpiledContent ?? "",
    );

    const exports: Record<string, unknown> = {};
    result(exports, require);
    return exports;
  }

  loadModule(
    request: string,
    callback: (err: Error | null, source: string | null) => void,
  ) {
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
