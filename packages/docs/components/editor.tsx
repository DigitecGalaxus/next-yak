"use client";
import { ComponentProps, use, useCallback } from "react";
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
import { useTranspile } from "@/lib/transformation/useTranspile";
import { ErrorBoundaryWithSnapshot } from "./errorBoundaryWithSnapshot";
import { css } from "next-yak";

export default dynamic(
  async function load() {
    return function Editor() {
      const themeConfig = useTheme();
      const [tab, setTab] = useState<keyof typeof files>("index");
      const [compiledOutput, setCompiledOutput] = useState<"CSS" | "TS">("CSS");
      const monacoEditorRef = useRef<
        | Parameters<
            NonNullable<ComponentProps<typeof MonacoEditor>["onMount"]>
          >[0]
        | null
      >(null);
      // list of refs to keep track of the models
      const modelRefs = useRef<Array<any>>([]);
      const highlighter = use(highlighterPromise);
      const compiledPanelRef = useRef<ImperativePanelHandle>(null);
      const [transpileResult, transpile] = useTranspile({
        mainFile: {
          name: "index",
          content: files["index"],
        },
        additionalFiles: [
          {
            name: "other",
            content: files["other"],
          },
          {
            name: "different.yak",
            content: files["different.yak"],
          },
        ],
      });

      const updateCode = useCallback(() => {
        const code = modelRefs.current.reduce((acc, model) => {
          acc[model.uri] = model.getValue();
          return acc;
        }, {});

        transpile({
          mainFile: {
            name: "index",
            content: code["file:///index.tsx"],
          },
          additionalFiles: [
            {
              name: "other",
              content: code["file:///other.tsx"],
            },
            {
              name: "different.yak",
              content: code["file:///different.yak.tsx"],
            },
          ],
        });
      }, []);

      const readableTranspiledResult = transpileResult
        ? {
            [transpileResult?.transpiledMainFile.name]:
              transpileResult?.transpiledMainFile,
            ...transpileResult.transpiledAdditionalFiles.reduce(
              (acc, file) => ({
                ...acc,
                [file.name]: file,
              }),
              {} as any,
            ),
          }
        : {};

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
                <div
                  css={css`
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                  `}
                >
                  <div
                    css={css`
                      display: flex;
                      gap: 1rem;
                    `}
                  >
                    <Primitive.TabsTrigger value="index">
                      index.tsx
                    </Primitive.TabsTrigger>
                    <Primitive.TabsTrigger value="other">
                      other.tsx
                    </Primitive.TabsTrigger>
                    <Primitive.TabsTrigger value="different.yak">
                      different.yak.ts
                    </Primitive.TabsTrigger>
                  </div>
                  <button
                    onClick={() => {
                      monacoEditorRef.current
                        ?.getAction("editor.action.formatDocument")
                        ?.run();
                    }}
                    title="format document"
                    css={css`
                      cursor: pointer;
                      &:hover {
                        color: var(--color-fd-primary);
                      }
                    `}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m16 22-1-4" />
                      <path d="M19 13.99a1 1 0 0 0 1-1V12a2 2 0 0 0-2-2h-3a1 1 0 0 1-1-1V4a2 2 0 0 0-4 0v5a1 1 0 0 1-1 1H6a2 2 0 0 0-2 2v.99a1 1 0 0 0 1 1" />
                      <path d="M5 14h14l1.973 6.767A1 1 0 0 1 20 22H4a1 1 0 0 1-.973-1.233z" />
                      <path d="m8 22 1-4" />
                    </svg>
                  </button>
                </div>
              </Primitive.TabsList>
              <MonacoEditor
                height="90vh"
                language="typescript"
                theme={
                  themeConfig.resolvedTheme === "dark"
                    ? "vitesse-dark"
                    : "vitesse-light"
                }
                path={`${tab}.tsx`}
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
                  Object.entries(files).forEach(([path, value]) => {
                    const model = monaco.editor.createModel(
                      value,
                      "typescript",
                      monaco.Uri.parse(`file:///${path}.tsx`),
                    );
                    modelRefs.current.push(model);
                  });
                }}
                onMount={async (editor, monaco) => {
                  monacoEditorRef.current = editor;

                  editor.addCommand(
                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
                    () => {
                      editor.trigger(
                        "editor",
                        "editor.action.formatDocument",
                        undefined,
                      );
                    },
                  );

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
                onChange={(_, editor) => {
                  updateCode();
                }}
              />
            </Primitive.Tabs>
          </Panel>
          <PanelResizeHandle />
          <Panel defaultSize={50}>
            <PanelGroup autoSaveId="vertical" direction="vertical">
              <Panel
                defaultSize={70}
                style={{
                  borderColor: "var(--color-fd-border)",
                  borderWidth: "0 1px 1px 1px",
                }}
              >
                <ErrorBoundaryWithSnapshot>
                  {transpileResult?.renderedMainComponent.error ? (
                    <div>{transpileResult.renderedMainComponent.error}</div>
                  ) : null}
                  {transpileResult?.renderedMainComponent.component}
                </ErrorBoundaryWithSnapshot>
              </Panel>
              <div
                style={{
                  backgroundColor: "var(--color-fd-secondary)",
                }}
              >
                <PanelResizeHandle></PanelResizeHandle>

                <div
                  style={{
                    borderColor: "var(--color-fd-border)",
                    borderWidth: "0 1px",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    onClick={() => {
                      const panel = compiledPanelRef.current;
                      if (panel) {
                        if (panel.getSize() > 0) {
                          panel.collapse();
                        } else {
                          panel.expand(30);
                        }
                      }
                    }}
                    css={css`
                      padding: 8px 12px;
                      border: none;
                      background-color: var(--color-fd);
                      cursor: pointer;
                      text-align: start;
                      color: var(--color-fd-muted-foreground);

                      &:hover {
                        color: var(--color-fd-accent-foreground);
                      }
                    `}
                  >
                    Compiled output
                  </div>
                  <Primitive.Tabs
                    onValueChange={(v) => setCompiledOutput(v as "CSS" | "TS")}
                    value={compiledOutput}
                    style={{
                      borderRadius: "0px",
                      borderWidth: "0",
                      backgroundColor:
                        themeConfig.resolvedTheme === "dark"
                          ? "#121212"
                          : "#ffffff",
                    }}
                  >
                    <Primitive.TabsList>
                      <Primitive.TabsTrigger value="CSS">
                        CSS
                      </Primitive.TabsTrigger>
                      <Primitive.TabsTrigger value="TS">
                        TS
                      </Primitive.TabsTrigger>
                    </Primitive.TabsList>
                  </Primitive.Tabs>
                </div>
              </div>
              <Panel
                collapsible
                collapsedSize={0}
                defaultSize={30}
                ref={compiledPanelRef}
                style={{
                  borderColor: "var(--color-fd-border)",
                  borderWidth: "0 1px ",
                  overflowY: "auto",
                  background:
                    themeConfig.resolvedTheme === "dark"
                      ? "#121212"
                      : "#ffffff",
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
                    <Primitive.TabsTrigger value="index">
                      index.tsx
                    </Primitive.TabsTrigger>
                    <Primitive.TabsTrigger value="other">
                      other.tsx
                    </Primitive.TabsTrigger>
                    <Primitive.TabsTrigger value="different.yak">
                      different.yak.ts
                    </Primitive.TabsTrigger>
                  </Primitive.TabsList>
                  {compiledOutput === "CSS" ? (
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
                            readableTranspiledResult?.[tab]?.css ?? "",
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
                  ) : compiledOutput === "TS" ? (
                    <div
                      style={{
                        margin: "16px 1ch",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: highlighter.codeToHtml(
                          readableTranspiledResult?.[tab]
                            ?.transpiledReadableContent ?? "",
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
                  ) : null}
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
    loading: () => (
      <p
        css={css`
          text-align: center;
          margin-top: 20px;
        `}
      >
        Loading Playground...
      </p>
    ),
  },
);

const files = {
  other: `import { styled, css } from "next-yak";

export const OtherButton = styled.div\`
  color: blue;
\`;

export const Mixin = css\`
  color: yellow;
\`;`,
  "different.yak": `const green = "00ff00";
export const myColor = \`#\${ green }\`;`,

  index: `import { styled } from "next-yak";
import { OtherButton, Mixin } from "./other";
import { myColor } from "./different.yak"

const Button = styled.div\`
  color: red;
  \${Mixin};
  color: \${myColor};
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
};
