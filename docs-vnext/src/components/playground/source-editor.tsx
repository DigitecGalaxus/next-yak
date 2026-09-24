"use client";

import MonacoEditor, { type Monaco, type OnMount } from "@monaco-editor/react";
import { shikiToMonaco } from "@shikijs/monaco";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import css from "shiki/langs/css.mjs";
import tsx from "shiki/langs/tsx.mjs";
import * as prettier from "prettier";
import * as typescriptParser from "prettier/plugins/typescript";
import * as estreePlugin from "prettier/plugins/estree";
import { use, useEffect, useRef } from "react";
import styled from "@/lib/langs/styled";
import cssStyled from "@/lib/langs/css-styled";
import { syntax, yakTheme } from "@/lib/yak-theme";
import { asset } from "@/lib/site";
import type { PlaygroundFile } from "@/lib/playground/types";

/**
 * Monaco checks types only for the `typescript` language, and shiki colours JSX only with the
 * `tsx` grammar. So the tsx grammar registers here under the name `typescript`: the editor
 * gets type checks and the same colours as every code block on the site.
 */
const tsxGrammar = tsx.find((grammar) => grammar.scopeName === "source.tsx")!;

/** ink.card (oklch(0.241 0.083 293)) as hex, because Monaco reads hex colors only. */
const CARD_FILL = "#221442";

/**
 * The site's code theme plus the editor chrome that only Monaco has. The editor paints the
 * card's own fill, so the editor and its title bar read as one surface, like the docs code
 * blocks. It must be opaque: Monaco draws the sticky scroll header over the code with the
 * editor background, and a transparent one lets the scrolled lines show through it.
 */
const editorTheme = {
  ...yakTheme,
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
    "editorStickyScroll.background": CARD_FILL,
    "editorStickyScrollGutter.background": CARD_FILL,
    "editorStickyScrollHover.background": "#2c1d52",
    "editorStickyScroll.shadow": "#0d061c99",
    "editorStickyScroll.border": `${syntax.punctuation}26`,
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

const highlighterPromise = createHighlighterCore({
  themes: [editorTheme],
  langs: [{ ...tsxGrammar, name: "typescript", aliases: [] }, css, styled, cssStyled],
  engine: createJavaScriptRegexEngine({ forgiving: true }),
});

const uriFor = (monaco: Monaco, name: string) => monaco.Uri.parse(`file:///${name}.tsx`);

/**
 * The source editor. It holds one Monaco model per file, so undo history and type checks
 * work across tabs, and the parent only switches which model shows.
 *
 * `path` picks the model to show, so switching tabs needs no code here.
 *
 * `files` seeds the models once. After that the editor owns the text and reports each
 * change through `onChange`. A new `resetKey` (reset, or a loaded share link) drops the
 * models and seeds them again.
 */
export function SourceEditor({
  files,
  activeFile,
  resetKey,
  onChange,
  onShortcutShare,
  editorRef,
}: {
  files: PlaygroundFile[];
  activeFile: string;
  resetKey: number;
  onChange: (name: string, content: string) => void;
  onShortcutShare: () => void;
  editorRef: React.RefObject<Parameters<OnMount>[0] | null>;
}) {
  // suspends until shiki is ready, so beforeMount can register the theme synchronously:
  // @monaco-editor/react does not wait for a promise from beforeMount
  const highlighter = use(highlighterPromise);
  const monacoRef = useRef<Monaco | null>(null);
  // the Monaco callbacks register once, so they read the latest props through refs
  const shareRef = useRef(onShortcutShare);
  shareRef.current = onShortcutShare;
  const changeRef = useRef(onChange);
  changeRef.current = onChange;
  // Monaco can finish loading after a share link replaced the files, and beforeMount may
  // run with the props of an older render, so seeding reads the files from here
  const filesRef = useRef(files);
  filesRef.current = files;

  // seed the models on mount and on every reset
  useEffect(() => {
    const monaco = monacoRef.current;
    if (!monaco) return;
    seedModels(monaco, filesRef.current);
    editorRef.current?.setModel(monaco.editor.getModel(uriFor(monaco, activeFile)));
    // only a reset reseeds; `files` changes on every keystroke
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  return (
    <MonacoEditor
      height="100%"
      theme={yakTheme.name}
      defaultLanguage="typescript"
      path={`${activeFile}.tsx`}
      options={{
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        fontSize: 13,
        lineHeight: 22,
        padding: { top: 14, bottom: 14 },
        minimap: { enabled: false },
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
        // every file model reports its edits, not only the one on screen: a format or a
        // find-and-replace can change a file that is not the active tab
        monaco.editor.onDidCreateModel((model) => {
          const name = model.uri.path.replace(/^\//, "").replace(/\.tsx$/, "");
          if (model.uri.path.includes("node_modules")) return;
          model.onDidChangeContent(() => changeRef.current(name, model.getValue()));
        });
        seedModels(monaco, filesRef.current);
        void addTypes(monaco);
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

        // Cmd/Ctrl+S formats and copies a share link, as in the old playground
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
  // dependencies first: a model that imports a file created after it shows a red
  // squiggle for a moment, until the imported model exists
  for (const file of [...files].reverse()) {
    monaco.editor.createModel(file.content, "typescript", uriFor(monaco, file.name));
  }
}

let typesPromise: Promise<Record<string, string>> | null = null;

async function addTypes(monaco: Monaco) {
  const ts = monaco.languages.typescript;
  ts.typescriptDefaults.setCompilerOptions({
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    jsx: ts.JsxEmit.ReactJSX,
    jsxImportSource: "next-yak",
    esModuleInterop: true,
    strict: true,
    allowNonTsExtensions: true,
  });
  ts.typescriptDefaults.setEagerModelSync(true);

  // types.json comes from scripts/generate-playground-types.mjs
  typesPromise ??= fetch(asset("/playground/types.json")).then((r) => r.json());
  try {
    for (const [path, content] of Object.entries(await typesPromise)) {
      ts.typescriptDefaults.addExtraLib(content, `file:///${path}`);
    }
  } catch {
    // without the types the editor still works, it only shows no type errors or hovers
  }
}
