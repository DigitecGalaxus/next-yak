import * as swc from "@swc/core";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { type Compilation } from "webpack";
// had to update package exports
// @ts-ignore
import cssLoader = require("next-yak/loaders/css-loader");

export const maxDuration = 60;

const wasmPath = path.resolve(
  process.cwd(),
  "./node_modules",
  "yak-swc/target/wasm32-wasip1/release/yak_swc.wasm",
);

export async function POST(request: NextRequest) {
  const code = (await request.json()) as Record<`file:///${string}`, string>;

  const result: Record<
    keyof typeof code,
    { original: string; transformed: string; css?: string }
  > = {};
  for (const [filePath, originalCode] of Object.entries(code) as [
    keyof typeof code,
    string,
  ][]) {
    result[filePath] = {
      original: originalCode,
      transformed: swc.transformSync(originalCode, {
        filename: "/bar/index.tsx",
        jsc: {
          experimental: {
            plugins: [[wasmPath, { basePath: "/foo/" }]],
          },
          target: "es2022",
          loose: false,
          minify: {
            compress: false,
            mangle: false,
          },
          preserveAllComments: true,
        },
        minify: false,
        isModule: true,
      }).code,
    };
  }

  const transpiledYakFile = swc.transformSync(
    result["file:///different.yak.ts"].original,
    {
      filename: "/bar/index.tsx",
      jsc: {
        target: "es5",
      },
      isModule: true,
      module: {
        type: "commonjs",
      },
    },
  );

  const mockLoader = new MockLoaderContext(transpiledYakFile.code);
  mockLoader.fs.setFile(
    "/src/index.tsx",
    result["file:///index.tsx"].transformed,
  );
  mockLoader.fs.setFile(
    "/src/./index.tsx",
    result["file:///index.tsx"].transformed,
  );
  mockLoader.fs.setFile(
    "/src/other.tsx",
    result["file:///other.tsx"].transformed,
  );
  mockLoader.fs.setFile(
    "/src/./other.tsx",
    result["file:///other.tsx"].transformed,
  );
  mockLoader.fs.setFile(
    "/src/different.yak.tsx",
    result["file:///different.yak.ts"].transformed,
  );
  mockLoader.fs.setFile(
    "/src/./different.yak.tsx",
    result["file:///different.yak.ts"].transformed,
  );

  mockLoader.resourcePath = "/src/index.tsx";

  for (const path of ["/src/index.tsx", "/src/other.tsx"]) {
    mockLoader.resourcePath = path;
    const p = createAsyncPromise(mockLoader);
    // @ts-ignore
    cssLoader.default.call(mockLoader, "", undefined);
    const x = (await p) as string;
    if (path === "/src/index.tsx") {
      result["file:///index.tsx"] = {
        ...result["file:///index.tsx"],
        css: x,
      };
    }
    if (path === "/src/other.tsx") {
      result["file:///other.tsx"] = {
        ...result["file:///other.tsx"],
        css: x,
      };
    }
  }

  return NextResponse.json(result, {
    status: 200,
  });
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
  files: Map<string, string> = new Map();

  setFile(path: string, content: string) {
    this.files.set(path, content);
  }

  readFile(
    path: string,
    encoding: string,
    callback: (err: Error | null, result: string | null) => void,
  ) {
    const content = this.files.get(path);
    if (content) {
      callback(null, content);
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

  constructor(public transpiledYakFile: string = "") {}

  async resolve(
    context: string,
    request: string,
    callback: (err: Error | null, result: string | null) => void,
  ) {
    const resolvedPath = `${context}/${request}.tsx`;
    callback(null, resolvedPath);
  }

  async importModule(request: string): Promise<Record<string, unknown>> {
    const wrappedContent = `
      "use strict";
      var exports = {};
      (function() {
        ${this.transpiledYakFile}
        return exports
      })();
    `;
    const evaluatedContent = eval?.(wrappedContent);
    return evaluatedContent;
  }

  loadModule(
    request: string,
    callback: (err: Error | null, source: string | null) => void,
  ) {
    callback(null, this.fs.files.get(request) || null);
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
      // experiments: {
      // debug: true,
      // },
    };
  }
}
