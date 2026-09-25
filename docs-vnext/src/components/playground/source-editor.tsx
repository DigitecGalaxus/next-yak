"use client";

import MonacoEditor, { type Monaco, type OnMount } from "@monaco-editor/react";
import { shikiToMonaco } from "@shikijs/monaco";
import * as prettier from "prettier";
import * as typescriptParser from "prettier/plugins/typescript";
import * as estreePlugin from "prettier/plugins/estree";
import { use, useEffect, useRef } from "react";
import { syntax, yakTheme } from "@/lib/yak-theme";
import { highlighterPromise as sharedHighlighter } from "@/lib/shiki";
import { asset } from "@/lib/site";
import type { FrameworkId } from "@/lib/playground/frameworks";
import type { PlaygroundFile } from "@/lib/playground/types";

/** ink.card as hex, Monaco reads hex colors only */
const CARD_FILL = "#221442";

const editorTheme = {
  ...yakTheme,
  name: "yak-editor",
  colors: {
    "editor.background": CARD_FILL,
    "editorGutter.background": CARD_FILL,
    "editor.foreground": syntax.fg,
    "editorLineNumber.foreground": `${syntax.comment}99`,
    "editorLineNumber.activeForeground": syntax.punctuation,
    "editorCursor.foreground": syntax.keyword,
    "editor.selectionBackground": `${syntax.keyword}33`,
    "editor.inactiveSelectionBackground": `${syntax.keyword}1f`,
    "editorBracketMatch.background": `${syntax.property}22`,
    "editorBracketMatch.border": `${syntax.property}66`,
    "editorWidget.background": syntax.bg,
    "editorHoverWidget.background": syntax.bg,
    "editorHoverWidget.border": `${syntax.punctuation}40`,
    "editorSuggestWidget.background": syntax.bg,
    "editorSuggestWidget.border": `${syntax.punctuation}40`,
    "editorSuggestWidget.selectedBackground": `${syntax.keyword}33`,
    "scrollbarSlider.background": `${syntax.punctuation}26`,
    "scrollbarSlider.hoverBackground": `${syntax.punctuation}40`,
  },
};

const highlighterPromise = sharedHighlighter.then(async (highlighter) => {
  await highlighter.loadTheme(editorTheme);
  return highlighter;
});

const uriFor = (monaco: Monaco, name: string) => monaco.Uri.parse(`file:///${name}.tsx`);

/**
 * One Monaco model per file. `files` seeds the models only on mount and when `resetKey`
 * changes; after that the editor owns the text and reports edits through `onChange`.
 */
export function SourceEditor({
  framework,
  files,
  activeFile,
  resetKey,
  onChange,
  onShortcutShare,
  editorRef,
}: {
  framework: FrameworkId;
  files: PlaygroundFile[];
  activeFile: string;
  resetKey: number;
  onChange: (name: string, content: string) => void;
  onShortcutShare: () => void;
  editorRef: React.RefObject<Parameters<OnMount>[0] | null>;
}) {
  // suspend here: @monaco-editor/react does not wait for a promise from beforeMount
  const highlighter = use(highlighterPromise);
  const monacoRef = useRef<Monaco | null>(null);
  // Monaco callbacks register once, so they read the latest props through refs
  const shareRef = useRef(onShortcutShare);
  shareRef.current = onShortcutShare;
  const changeRef = useRef(onChange);
  changeRef.current = onChange;
  // beforeMount can run with the props of an older render
  const filesRef = useRef(files);
  filesRef.current = files;
  const frameworkRef = useRef(framework);
  frameworkRef.current = framework;

  useEffect(() => {
    const monaco = monacoRef.current;
    if (!monaco) return;
    seedModels(monaco, filesRef.current);
    void addTypes(monaco, frameworkRef.current);
    editorRef.current?.setModel(monaco.editor.getModel(uriFor(monaco, activeFile)));
    // only a reset reseeds; `files` changes on every keystroke
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  return (
    <MonacoEditor
      height="100%"
      theme={editorTheme.name}
      defaultLanguage="typescript"
      path={`${activeFile}.tsx`}
      options={{
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        fontSize: 13,
        lineHeight: 22,
        padding: { top: 14, bottom: 14 },
        minimap: { enabled: false },
        // the files are short, and a pinned line under the header reads like a second header
        stickyScroll: { enabled: false },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: "on",
        tabSize: 2,
        lineNumbersMinChars: 3,
        renderLineHighlight: "none",
        overviewRulerLanes: 0,
        guides: { indentation: false },
        fixedOverflowWidgets: true,
      }}
      loading={null}
      beforeMount={(monaco) => {
        monacoRef.current = monaco;
        shikiToMonaco(highlighter, monaco);
        // listen on every model, an edit can change a file that is not the active tab
        monaco.editor.onDidCreateModel((model) => {
          if (model.uri.path.includes("node_modules")) return;
          const name = model.uri.path.replace(/^\//, "").replace(/\.tsx$/, "");
          model.onDidChangeContent(() => changeRef.current(name, model.getValue()));
        });
        seedModels(monaco, filesRef.current);
        void addTypes(monaco, frameworkRef.current);
      }}
      onMount={(editor, monaco) => {
        editorRef.current = editor;
        editor.setModel(monaco.editor.getModel(uriFor(monaco, activeFile)));

        monaco.languages.registerDocumentFormattingEditProvider("typescript", {
          async provideDocumentFormattingEdits(model) {
            const text = await prettier.format(model.getValue(), {
              parser: "typescript",
              plugins: [typescriptParser, estreePlugin],
            });
            return [{ range: model.getFullModelRange(), text }];
          },
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
          await editor.getAction("editor.action.formatDocument")?.run();
          shareRef.current();
        });
      }}
    />
  );
}

function seedModels(monaco: Monaco, files: PlaygroundFile[]) {
  for (const model of monaco.editor.getModels()) model.dispose();
  // dependencies first, or an import shows a brief error until its model exists
  for (const file of [...files].reverse()) {
    monaco.editor.createModel(file.content, "typescript", uriFor(monaco, file.name));
  }
}

const typesPromises = new Map<FrameworkId, Promise<Record<string, string>>>();
let extraLibs: { dispose(): void }[] = [];
let typesFor: FrameworkId | null = null;

/** JSX settings as in each framework's own tsconfig */
const jsxSettings = (monaco: Monaco, framework: FrameworkId) => {
  const ts = monaco.languages.typescript;
  return framework === "solid"
    ? { jsx: ts.JsxEmit.Preserve, jsxImportSource: "@solidjs/web" }
    : { jsx: ts.JsxEmit.ReactJSX, jsxImportSource: "next-yak" };
};

async function addTypes(monaco: Monaco, framework: FrameworkId) {
  if (typesFor === framework) return;
  typesFor = framework;
  const ts = monaco.languages.typescript;
  ts.typescriptDefaults.setCompilerOptions({
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    ...jsxSettings(monaco, framework),
    esModuleInterop: true,
    strict: true,
    allowNonTsExtensions: true,
  });
  ts.typescriptDefaults.setEagerModelSync(true);

  let types = typesPromises.get(framework);
  if (!types) {
    types = fetch(asset(`/playground/types/${framework}.json`)).then((r) => r.json());
    typesPromises.set(framework, types);
  }
  try {
    const libs = await types;
    // a later switch owns the libraries now
    if (typesFor !== framework) return;
    for (const lib of extraLibs) lib.dispose();
    extraLibs = Object.entries(libs).map(([path, content]) =>
      ts.typescriptDefaults.addExtraLib(content, `file:///${path}`),
    );
  } catch {
    typesPromises.delete(framework);
    if (typesFor === framework) typesFor = null;
    // the editor still works without types
  }
}
