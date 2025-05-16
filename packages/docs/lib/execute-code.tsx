import { runLoaderForSingleFile } from "@/components/mockedLoader";
import React, { createElement, isValidElement, ReactElement } from "react";

export async function executeCode(
  transformCode: (codeString: string, opts: any) => { code: string },
  codeString: string,
  dependencies: Record<string, unknown>,
  otherFiles: { name: string; content: string }[],
): Promise<ReactElement | null> {
  const otherFilesTransformed: {
    name: string;
    content: string;
    exports: Record<string, unknown>;
    transformedCode: string;
    css: string;
  }[] = [];
  for (const file of otherFiles) {
    const { name, content } = file;
    // Process each file as needed
    // For example, you can log the file name and content
    console.log(`Processing file: ${name}`);
    console.log(`Content: ${content}`);
    console.log(`Dependencies: ${dependencies}`);

    const { exports, transformedCode } = transform(
      transformCode,
      content,
      dependencies,
    );

    console.log({ transformedCode });

    otherFilesTransformed.push({
      name,
      content,
      exports,
      transformedCode,
      css: await runLoaderForSingleFile(transformedCode, name),
    });
  }

  console.log({ otherFilesTransformed });

  const { exports, transformedCode } = transform(transformCode, codeString, {
    ...dependencies,
    ...otherFilesTransformed.reduce((acc, { name, exports }) => {
      console.log({
        filename: name.replace("file://", ".").replace(".tsx", ""),
      });
      acc[name.replace("file://", ".").replace(".tsx", "")] = exports;
      return acc;
    }, {} as any),
  });

  if (!("default" in exports)) {
    return null;
  }
  const OriginalComponent = exports.default;

  // console.log({ transformedCode });

  const css = await runLoaderForSingleFile(
    transformedCode,
    undefined,
    otherFilesTransformed.map(({ name, transformedCode }) => ({
      name,
      content: transformedCode,
    })),
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
  if (isValidElement(Comp)) return Comp;
  // @ts-expect-error Types don't work here
  if (typeof Comp === "function") return createElement(Comp);
  if (typeof Comp === "string") {
    return Comp as unknown as ReactElement;
  }

  return null;
}

export function transform(
  transformCode: (codeString: string, opts: any) => { code: string },
  codeString: string,
  dependencies: Record<string, unknown>,
) {
  const transformedCode = transformCode(codeString, {
    filename: "/bar/index.tsx",
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

  return { exports, transformedCode };
}
