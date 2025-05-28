import React, { createElement, isValidElement, ReactElement } from "react";
import * as prettier from "prettier";
import * as babelParser from "prettier/parser-babel";
import * as estreePlugin from "prettier/plugins/estree";
import { runLoaderForSingleFile } from "./mockedLoader";
import type { transform as WasmTransform } from "../../playground-wasm/out";

export function executeCode(
  {
    css,
    otherFilesTransformed,
    transformedCodeToDisplay,
    transformedCodeToExecute,
  }: Awaited<ReturnType<typeof transformAll>>,
  dependencies: Record<string, unknown>,
): {
  comp: ReactElement;
  transformedCodeToDisplay: string;
  css: string;
  otherFilesTransformed: {
    name: string;
    content: string;
    transformedCodeToExecute: string;
    transformedCodeToDisplay: string;
    css: string;
  }[];
} | null {
  const rootFileDependencies = {
    ...dependencies,
    ...otherFilesTransformed.reduce(
      (acc, { name, transformedCodeToExecute }) => {
        acc[`./${name}`] = createExport(transformedCodeToExecute, dependencies);
        return acc;
      },
      {} as any,
    ),
  };

  const exports = createExport(transformedCodeToExecute, rootFileDependencies);

  if (!("default" in exports)) {
    return null;
  }
  const OriginalComponent = exports.default;

  let Comp = OriginalComponent;
  // Create a wrapper component that includes the style
  if (css && typeof OriginalComponent === "function") {
    Comp = (props: any) => {
      return React.createElement(
        React.Fragment,
        null,
        [
          React.createElement("style", {
            dangerouslySetInnerHTML: { __html: css },
            key: "index",
          }),
          ...otherFilesTransformed.map(({ css }, idx) =>
            React.createElement("style", {
              dangerouslySetInnerHTML: { __html: css },
              key: idx,
            }),
          ),
        ],
        // @ts-expect-error error
        React.createElement(OriginalComponent, props),
      );
    };
  }

  if (!Comp) return null;
  if (isValidElement(Comp))
    return { comp: Comp, transformedCodeToDisplay, css, otherFilesTransformed };
  if (typeof Comp === "function")
    return {
      // @ts-expect-error Types don't work here
      comp: createElement(Comp),
      transformedCodeToDisplay,
      css,
      otherFilesTransformed,
    };
  if (typeof Comp === "string") {
    return {
      comp: Comp as unknown as ReactElement,
      transformedCodeToDisplay,
      css,
      otherFilesTransformed,
    };
  }

  return null;
}

export async function transformAll(
  transformCode: typeof WasmTransform,
  mainFileName: string,
  mainFileCodeString: string,
  otherFiles: { name: string; content: string }[],
  options?: {
    minify?: boolean;
    showComments?: boolean;
  },
) {
  const otherFilesTransformed: {
    name: string;
    content: string;
    transformedCodeToExecute: string;
    transformedCodeToDisplay: string;
    css: string;
  }[] = [];
  for (const file of otherFiles) {
    const { name, content } = file;

    try {
      const { transformedCode, transformedCodeToDisplay } = await transform(
        transformCode,
        name + ".tsx",
        content,
        options,
      );

      otherFilesTransformed.push({
        name,
        content,
        transformedCodeToExecute: transformedCode,
        transformedCodeToDisplay,
        css: await runLoaderForSingleFile(content, transformedCode, name),
      });
    } catch (err) {
      if (typeof err === "string") {
        throw `${err.split("\n")[0].replace("x ", "")} in ${file.name}.tsx`;
      }
      throw err;
    }
  }

  try {
    const { transformedCode, transformedCodeToDisplay } = await transform(
      transformCode,
      mainFileName + ".tsx",
      mainFileCodeString,
      options,
    );

    const css = await runLoaderForSingleFile(
      mainFileCodeString,
      transformedCode,
      mainFileName,
      otherFilesTransformed.map(
        ({ name, transformedCodeToExecute: transformedCode, content }) => ({
          name,
          originalContent: content,
          transpiledContent: transformedCode,
        }),
      ),
    );

    return {
      css,
      otherFilesTransformed,
      transformedCodeToDisplay,
      transformedCodeToExecute: transformedCode,
    };
  } catch (err) {
    if (typeof err === "string") {
      throw `${err.split("\n")[0].replace("x ", "")} in ${mainFileName}.tsx`;
    }
    throw err;
  }
}

function createExport(
  transformedCode: string,
  dependencies: Record<string, unknown>,
) {
  const exports: Record<string, unknown> = {};
  const require = (path: string) => {
    if (dependencies[path]) {
      return dependencies[path];
    }
    throw Error(`Module not found: ${path}.`);
  };
  const result = new Function("exports", "require", transformedCode);

  result(exports, require);
  return exports;
}

async function transform(
  transformCode: typeof WasmTransform,
  fileName: string,
  codeString: string,
  options?: {
    minify?: boolean;
    showComments?: boolean;
  },
) {
  const transformedCode = transformCode(
    codeString,
    {
      filename: fileName,
      jsc: {
        target: "es2022",
        loose: false,
        minify: {
          compress: false,
          mangle: false,
        },
        preserveAllComments: true,
      },
      module: {
        type: "commonjs",
      },
      minify: false, // don't minify the react elements
    },
    {
      minify: options?.minify ?? false, // minify the class names and don't add display names
    },
  ).code;

  let transformedCodeToDisplay = transformCode(
    codeString,
    {
      filename: fileName,
      jsc: {
        target: "es2022",
        loose: false,
        minify: {
          compress: false,
          mangle: false,
        },
        preserveAllComments: options?.showComments ?? true,
      },
      minify: false, // don't minify the react elements
    },
    {
      minify: options?.minify ?? false, // minify the class names and don't add display names
    },
  ).code;

  transformedCodeToDisplay = await prettier.format(transformedCodeToDisplay, {
    parser: "babel",
    plugins: [babelParser, estreePlugin as any],
  });

  return { transformedCode, transformedCodeToDisplay };
}
