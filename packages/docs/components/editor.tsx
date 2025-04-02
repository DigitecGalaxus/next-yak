"use client";
import React, { use, useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";
import { shikiToMonaco } from "@shikijs/monaco";
import { useRef, useState } from "react";
import { Primitive } from "fumadocs-ui/components/tabs";
import { useTheme } from "next-themes";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { addTypesToMonaco } from "@/lib/editor/addTypes";
import { useSearchParams } from "next/navigation";
import { highlighterPromise } from "@/lib/shiki";

export default function Editor() {
  const themeConfig = useTheme();
  const [tab, setTab] = useState<keyof typeof files>("index.tsx");
  // list of refs to keep track of the models
  const modelRefs = useRef<Array<any>>([]);
  const [response, setResponse] = useState(initialResponse);
  const searchParams = useSearchParams();
  const realtime = !!searchParams.get("realtime");
  const highlighter = use(highlighterPromise);

  const updateCode = useCallback(() => {
    const code = modelRefs.current.reduce((acc, model) => {
      acc[model.uri] = model.getValue();
      return acc;
    }, {});
    fetch("/api/transform", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(code),
    })
      .then((res) => res.json())
      .then((response) => {
        setResponse(response);
      });
  }, []);

  return (
    <PanelGroup
      autoSaveId="horizontal"
      direction="horizontal"
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      <Panel
        defaultSize={50}
        style={{
          borderWidth: "0 0 1px 1px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            margin: "1rem 0",
          }}
        >
          Input
        </h1>
        <Primitive.Tabs
          onValueChange={(v) => setTab(v as keyof typeof files)}
          value={tab}
          style={{
            borderRadius: "0px",
            borderWidth: "1px 0 0 0",
            height: "100%",
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

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium duration-100 disabled:pointer-events-none disabled:opacity-50 hover:bg-fd-accent hover:text-fd-accent-foreground absolute z-[2]"
            aria-label="Copy Text"
            style={{
              top: "3rem",
              right: "1rem",
            }}
            onClick={updateCode}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.2}
              stroke="currentColor"
              style={{
                width: "2rem",
                height: "2rem",
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z"
              />
            </svg>
          </button>
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
              fontSize: 16,
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
              Object.entries(files).forEach(([path, { value, language }]) => {
                const model = monaco.editor.createModel(
                  value,
                  language,
                  monaco.Uri.parse(`file:///${path}`),
                );
                modelRefs.current.push(model);
              });
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
              if (realtime) {
                updateCode();
              }
            }}
          />
        </Primitive.Tabs>
      </Panel>
      <PanelResizeHandle />
      <Panel defaultSize={50}>
        <PanelGroup autoSaveId="vertical" direction="vertical">
          <Panel
            defaultSize={60}
            style={{
              borderColor: "hsl(var(--border)/1)",
              borderWidth: "0 1px 1px 1px",
            }}
          >
            <h2
              style={{
                textAlign: "center",
                margin: "1rem 0",
              }}
            >
              CSS output
            </h2>
            <Primitive.Tabs
              onValueChange={(v) => setTab(v as keyof typeof files)}
              value={tab}
              style={{
                borderRadius: "0px",
                borderWidth: "1px 0 0 0",
                height: "100%",
                backgroundColor:
                  themeConfig.resolvedTheme === "dark" ? "#121212" : "#ffffff",
              }}
            >
              <Primitive.TabsList>
                <Primitive.TabsTrigger value="index.tsx">
                  index.module.css
                </Primitive.TabsTrigger>
                <Primitive.TabsTrigger value="other.tsx">
                  other.module.css
                </Primitive.TabsTrigger>
              </Primitive.TabsList>
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
            </Primitive.Tabs>
          </Panel>
          <PanelResizeHandle />
          <Panel
            collapsible
            collapsedSize={0}
            defaultSize={40}
            style={{
              borderColor: "hsl(var(--border)/1)",
              borderWidth: "0 1px 1px 1px",
            }}
          >
            <h2
              style={{
                textAlign: "center",
                margin: "1rem 0",
              }}
            >
              JS output
            </h2>
            <Primitive.Tabs
              onValueChange={(v) => setTab(v as keyof typeof files)}
              value={tab}
              style={{
                borderRadius: "0px",
                borderWidth: "1px 0 0 0",
                height: "100%",
                backgroundColor:
                  themeConfig.resolvedTheme === "dark" ? "#121212" : "#ffffff",
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
            </Primitive.Tabs>
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  );
}

const files = {
  "other.tsx": {
    value: `import { styled } from "next-yak";

export const OtherButton = styled.div\`
  color: blue;
\`;`,
    language: "typescript",
  },
  "different.yak.ts": {
    value: `const green = "00ff00";
export const myColor = \`#\${ green }\`;`,
    language: "typescript",
  },

  "index.tsx": {
    value: `import { styled } from "next-yak";
import { OtherButton } from "./other";
import { myColor } from "./different.yak";

const Button = styled.div\`
  color: \${myColor};
\`;

const Component = () => {
  return (
  <>
    <Button>
      Hello, world!
    </Button>
    <OtherButton>
      Hello, world!
    </OtherButton>
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
