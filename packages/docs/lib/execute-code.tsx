import { runLoaderForSingleFile } from "@/components/mockedLoader";
import React, { createElement, isValidElement, ReactElement } from "react";

export async function executeCode(
  transformCode: (codeString: string, opts: any) => { code: string },
  codeString: string,
  dependencies: Record<string, unknown>,
  otherFiles: { name: string; content: string }[],
): Promise<{
  comp: ReactElement;
  transformedCodeToDisplay: string;
  css: string;
  otherFilesTransformed: {
    name: string;
    content: string;
    exports: Record<string, unknown>;
    transformedCodeToExecute: string;
    transformedCodeToDisplay: string;
    css: string;
  }[];
} | null> {
  const otherFilesTransformed: {
    name: string;
    content: string;
    exports: Record<string, unknown>;
    transformedCodeToExecute: string;
    transformedCodeToDisplay: string;
    css: string;
  }[] = [];
  for (const file of otherFiles) {
    const { name, content } = file;
    // Process each file as needed
    // For example, you can log the file name and content
    console.log(`Processing file: ${name}`);
    console.log(`Content: ${content}`);
    console.log(`Dependencies: ${dependencies}`);

    const { exports, transformedCode, transformedCodeToDisplay } = transform(
      transformCode,
      name,
      content,
      dependencies,
    );

    console.log({ transformedCode });

    otherFilesTransformed.push({
      name,
      content,
      exports,
      transformedCodeToExecute: transformedCode,
      transformedCodeToDisplay,
      css: !name.endsWith("yak.ts")
        ? await runLoaderForSingleFile(transformedCode, name)
        : "",
    });
  }

  console.log({ otherFilesTransformed });

  const { exports, transformedCode, transformedCodeToDisplay } = transform(
    transformCode,
    "index.tsx",
    codeString,
    {
      ...dependencies,
      ...otherFilesTransformed.reduce((acc, { name, exports }) => {
        console.log({
          filename: name
            .replace("file://", ".")
            .replace(".tsx", "")
            .replace(".ts", ""),
        });
        acc[
          name.replace("file://", ".").replace(".tsx", "").replace(".ts", "")
        ] = exports;
        return acc;
      }, {} as any),
    },
  );

  if (!("default" in exports)) {
    return null;
  }
  const OriginalComponent = exports.default;

  // console.log({ transformedCode });

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

export function transform(
  transformCode: (codeString: string, opts: any) => { code: string },
  fileName: string,
  codeString: string,
  dependencies: Record<string, unknown>,
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

  const transformedCodeToDisplay = transformCode(codeString, {
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

  const exports: Record<string, unknown> = {};
  const require = (path: string) => {
    if (dependencies[path]) {
      return dependencies[path];
    }
    throw Error(`Module not found: ${path}.`);
  };
  const result = new Function("exports", "require", transformedCode);

  result(exports, require);

  console.log("transformed");

  console.log({ transformedCode });

  return { exports, transformedCode, transformedCodeToDisplay };
}
