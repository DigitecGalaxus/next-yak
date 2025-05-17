import { runLoaderForSingleFile } from "@/components/mockedLoader";
import React, { createElement, isValidElement, ReactElement } from "react";
import * as prettier from "prettier";
import * as babelParser from "prettier/parser-babel";
import * as estreePlugin from "prettier/plugins/estree";

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
        console.log({
          filename: name
            .replace("file://", ".")
            .replace(".tsx", "")
            .replace(".ts", ""),
        });
        acc[
          name.replace("file://", ".").replace(".tsx", "").replace(".ts", "")
        ] = createExport(transformedCodeToExecute, dependencies);
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

  // console.log({ transformedCode });

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

export async function transform(
  transformCode: (codeString: string, opts: any) => { code: string },
  fileName: string,
  codeString: string,
) {
  const transformedCode = transformCode(codeString, {
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
    minify: false,
    isModule: true,
  }).code;

  let transformedCodeToDisplay = transformCode(codeString, {
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
    minify: false,
    isModule: true,
  }).code;

  transformedCodeToDisplay = await prettier.format(transformedCodeToDisplay, {
    parser: "babel",
    plugins: [babelParser, estreePlugin as any],
  });

  return { transformedCode, transformedCodeToDisplay };
}

export async function transformAll(
  transformCode: (codeString: string, opts: any) => { code: string },
  codeString: string,
  otherFiles: { name: string; content: string }[],
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
    // Process each file as needed
    // For example, you can log the file name and content

    const { transformedCode, transformedCodeToDisplay } = await transform(
      transformCode,
      name,
      content,
    );

    otherFilesTransformed.push({
      name,
      content,
      transformedCodeToExecute: transformedCode,
      transformedCodeToDisplay,
      css: !name.endsWith("yak.ts")
        ? await runLoaderForSingleFile(transformedCode, name)
        : "",
    });
  }

  console.log({ otherFilesTransformed });

  const { transformedCode, transformedCodeToDisplay } = await transform(
    transformCode,
    "index.tsx",
    codeString,
  );
  const css = await runLoaderForSingleFile(
    transformedCode,
    undefined,
    otherFilesTransformed.map(
      ({ name, transformedCodeToExecute: transformedCode }) => ({
        name,
        content: transformedCode,
      }),
    ),
  );

  return {
    css,
    otherFilesTransformed,
    transformedCodeToDisplay,
    transformedCodeToExecute: transformedCode,
  };
}
