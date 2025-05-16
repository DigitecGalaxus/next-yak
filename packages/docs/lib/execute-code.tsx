import { runLoaderForSingleFile } from "@/components/mockedLoader";
import React, { createElement, isValidElement, ReactElement } from "react";

export async function executeCode(
  transformCode: (codeString: string, opts: any) => { code: string },
  codeString: string,
  dependencies: Record<string, unknown>,
): Promise<ReactElement | null> {
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

  const OriginalComponent = exports.default;

  const css = await runLoaderForSingleFile(transformedCode);

  let Comp = OriginalComponent;
  // Create a wrapper component that includes the style
  if (css && typeof OriginalComponent === "function") {
    Comp = (props: any) => {
      return React.createElement(
        React.Fragment,
        null,
        React.createElement("style", {
          dangerouslySetInnerHTML: { __html: css },
        }),
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
