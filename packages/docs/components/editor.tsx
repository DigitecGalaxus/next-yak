"use client";
import { use, useCallback, useTransition } from "react";
import * as React from "react";
import * as NextYakInternal from "next-yak/internal";
import MonacoEditor from "@monaco-editor/react";
import { shikiToMonaco } from "@shikijs/monaco";
import { useRef, useState } from "react";
import { Primitive } from "fumadocs-ui/components/tabs";
import { useTheme } from "next-themes";
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
  ImperativePanelHandle,
} from "react-resizable-panels";
import { addTypesToMonaco } from "@/lib/editor/addTypes";
import { highlighterPromise } from "@/lib/shiki";
import dynamic from "next/dynamic";
import { runLoader } from "./mockedLoader";
import { executeCode, transform as transformCode } from "@/lib/execute-code";
import { ErrorBoundary } from "./errorBoundary";

import * as prettier from "prettier";
import * as babelParser from "prettier/parser-babel";
import * as estreePlugin from "prettier/plugins/estree";
import { useRunner } from "@/lib/useRunner";
import { ErrorBoundaryWithFallback } from "./errorBoundaryWithFallback";

export default dynamic(
  async function load() {
    const { default: init, start, transform } = await import("playground-wasm");
    await init();
    start();
    console.log("WASM initialized");
    return function Editor() {
      const themeConfig = useTheme();
      const [tab, setTab] = useState<keyof typeof files>("index.tsx");
      // list of refs to keep track of the models
      const modelRefs = useRef<Array<any>>([]);
      const [response, setResponse] = useState(initialResponse);
      const highlighter = use(highlighterPromise);
      const compiledPanelRef = useRef<ImperativePanelHandle>(null);
      const [component, setComponent] = useState<any>(null);

      const updateCode = useCallback(() => {
        const code = modelRefs.current.reduce((acc, model) => {
          acc[model.uri] = model.getValue();
          return acc;
        }, {});

        executeCode(
          transform,
          code["file:///index.tsx"],
          {
            react: React,
            "next-yak/internal": NextYakInternal,
            "./theFile.yak.css!=!./theFile?./theFile.yak.css": {},
          },
          [
            {
              name: "file:///other.tsx",
              content: code["file:///other.tsx"],
            },
          ],
        )
          .then(setComponent)
          .catch(console.log);

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
            transformed: transform(originalCode, {
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
              minify: false,
              isModule: true,
            }).code,
          };
        }

        const transpiledYakFile = transform(
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

        runLoader(result, transpiledYakFile.code).then(async (r) => {
          for (const key in result) {
            const { transformed } = result[key];
            result[key].transformed = await prettier.format(transformed, {
              parser: "babel",
              plugins: [babelParser, estreePlugin as any],
            });
          }

          setResponse(result as any);
        });
      }, []);

      return (
        <PanelGroup
          autoSaveId="horizontal"
          direction="horizontal"
          style={{
            paddingInline: "1rem",
            fontSize: "14px",
          }}
        >
          <Panel
            defaultSize={50}
            style={{
              borderWidth: "0 0 1px 1px",
            }}
          >
            <Primitive.Tabs
              onValueChange={(v) => setTab(v as keyof typeof files)}
              value={tab}
              style={{
                borderRadius: "0px",
                borderWidth: "1px 0 0 0",
                backgroundColor:
                  themeConfig.resolvedTheme === "dark" ? "#121212" : "#ffffff",
                position: "relative",
              }}
              className="group"
            >
              <Primitive.TabsList>
                <Primitive.TabsTrigger value="index.tsx">
                  index.tsx
                </Primitive.TabsTrigger>
                <Primitive.TabsTrigger value="other.tsx">
                  other.tsx
                </Primitive.TabsTrigger>
                <Primitive.TabsTrigger value="different.yak.ts">
                  different.yak.ts
                </Primitive.TabsTrigger>
              </Primitive.TabsList>
              <MonacoEditor
                height="90vh"
                language="typescript"
                theme={
                  themeConfig.resolvedTheme === "dark"
                    ? "vitesse-dark"
                    : "vitesse-light"
                }
                path={tab}
                options={{
                  fontSize: 14,
                  padding: { top: 16 },
                  minimap: { enabled: false },
                  automaticLayout: true,
                  wordWrap: "on",
                  formatOnType: true,
                  lineDecorationsWidth: 1,
                  lineNumbersMinChars: 4,
                  tabSize: 2,
                }}
                beforeMount={async (monaco) => {
                  // maybe clone this to change that the highlighter sets tsx coloring to typescript language of the editor
                  // because the editor has to be set to typescript to get type information and shiki wants to be set to tsx for the
                  // correct coloring
                  shikiToMonaco(highlighter, monaco);

                  monaco.editor.setTheme("vitesse-dark");
                  monaco.editor.getModels().forEach((model) => model.dispose());

                  // add files from the files object to the editor
                  Object.entries(files).forEach(
                    ([path, { value, language }]) => {
                      const model = monaco.editor.createModel(
                        value,
                        language,
                        monaco.Uri.parse(`file:///${path}`),
                      );
                      modelRefs.current.push(model);
                    },
                  );
                }}
                onMount={async (editor, monaco) => {
                  addTypesToMonaco(monaco);
                  monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
                    {
                      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
                      jsxImportSource: "next-yak",
                      esModuleInterop: true,
                      paths: {
                        react: ["/node_modules/@types/react"],
                      },
                    },
                  );
                }}
                onChange={() => {
                  updateCode();
                }}
              />
            </Primitive.Tabs>
          </Panel>
          <PanelResizeHandle />
          <Panel defaultSize={50}>
            <PanelGroup autoSaveId="vertical" direction="vertical">
              <Panel
                defaultSize={100}
                style={{
                  borderColor: "var(--color-fd-border)",
                  borderWidth: "0 1px 1px 1px",
                }}
              >
                <ErrorBoundaryWithFallback
                // key={response["file:///index.tsx"].transformed ?? "null"}
                // fallback={<div>Error</div>}
                >
                  {component}
                </ErrorBoundaryWithFallback>
              </Panel>
              <PanelResizeHandle
                style={{
                  borderColor: "var(--color-fd-border)",
                  borderWidth: "0 1px",
                }}
              >
                <button
                  onClick={() => {
                    const panel = compiledPanelRef.current;
                    if (panel) {
                      if (panel.getSize() > 0) {
                        panel.collapse();
                      } else {
                        panel.expand(66);
                      }
                    }
                  }}
                  style={{
                    padding: "8px 12px",
                  }}
                >
                  Compiled output
                </button>
              </PanelResizeHandle>
              <Panel
                collapsible
                collapsedSize={0}
                defaultSize={0}
                ref={compiledPanelRef}
                style={{
                  borderColor: "var(--color-fd-border)",
                  borderWidth: "0 1px 1px 1px",
                  overflowY: "auto",
                }}
              >
                <Primitive.Tabs
                  onValueChange={(v) => setTab(v as keyof typeof files)}
                  value={tab}
                  style={{
                    borderRadius: "0px",
                    borderWidth: "1px 0 0 0",
                    backgroundColor:
                      themeConfig.resolvedTheme === "dark"
                        ? "#121212"
                        : "#ffffff",
                  }}
                >
                  <Primitive.TabsList>
                    <Primitive.TabsTrigger value="index.tsx">
                      index.tsx
                    </Primitive.TabsTrigger>
                    <Primitive.TabsTrigger value="other.tsx">
                      other.tsx
                    </Primitive.TabsTrigger>
                    <Primitive.TabsTrigger value="different.yak.ts">
                      different.yak.ts
                    </Primitive.TabsTrigger>
                  </Primitive.TabsList>
                  <div
                    style={{
                      margin: "16px 1ch",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: highlighter.codeToHtml(
                        response?.[`file:///${tab}`].transformed ?? "",
                        {
                          lang: "typescript",
                          theme:
                            themeConfig.resolvedTheme === "dark"
                              ? "vitesse-dark"
                              : "vitesse-light",
                        },
                      ),
                    }}
                  />
                  <div
                    style={{
                      borderRadius: "0px",
                      borderWidth: "1px 0 0 0",
                      backgroundColor:
                        themeConfig.resolvedTheme === "dark"
                          ? "#121212"
                          : "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        margin: "16px 1ch",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: highlighter.codeToHtml(
                          response?.[`file:///${tab}`].css ?? "",
                          {
                            lang: "css",
                            theme:
                              themeConfig.resolvedTheme === "dark"
                                ? "vitesse-dark"
                                : "vitesse-light",
                          },
                        ),
                      }}
                    />
                  </div>
                </Primitive.Tabs>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      );
    };
  },
  {
    ssr: false,
    loading: () => <p>Loading WASM...</p>,
  },
);

const files = {
  "other.tsx": {
    value: `import { styled, css } from "next-yak";

export const OtherButton = styled.div\`
  color: blue;
\`;

export const Mixin = css\`
  color: yellow;
\`;`,
    language: "typescript",
  },
  "different.yak.ts": {
    value: `const green = "00ff00";
export const myColor = \`#\${ green }\`;`,
    language: "typescript",
  },

  "index.tsx": {
    value: `import React from "react";
import { styled } from "next-yak";
import { OtherButton, Mixin } from "./other";

const Button = styled.div\`
  color: red;
  \${Mixin};
\`;

export default function Component() {
  return (
  <>
    <Button>
      Hello, world!
      </Button>
    <OtherButton>Test</OtherButton>
  </>
  );
};`,
    language: "typescript",
  },
};

const initialResponse = {
  "file:///index.tsx": {
    original: files["index.tsx"].value,
    transformed: `import { styled } from "next-yak/internal";
import __styleYak from "./index.yak.module.css!=!./index?./index.yak.module.css";
import { OtherButton } from "./other";
import { myColor } from "./different.yak";
const Button = /*YAK Extracted CSS:
.Button {
  color: --yak-css-import: url("./different.yak:myColor",mixin);
}
*/ /*#__PURE__*/ styled.div(__styleYak.Button);
const Component = ()=>{
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement(Button, null, "Hello, world!"), /*#__PURE__*/ React.createElement(OtherButton, null, "Hello, world!"));
};`,
    css: `.Button {
  color: #00ff00;
}`,
  },
  "file:///other.tsx": {
    original: files["other.tsx"].value,
    transformed: `import { styled } from "next-yak/internal";
import __styleYak from "./index.yak.module.css!=!./index?./index.yak.module.css";
export const OtherButton = /*YAK Extracted CSS:
.OtherButton {
  color: blue;
}
*/ /*#__PURE__*/ styled.div(__styleYak.OtherButton);`,
    css: `.OtherButton {
  color: blue;
}`,
  },
  "file:///different.yak.ts": {
    original: files["different.yak.ts"].value,
    transformed: `const green = "00ff00";
export const myColor = \`#\${green}\`;`,
    css: undefined,
  },
};
