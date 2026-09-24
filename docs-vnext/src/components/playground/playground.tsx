"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OnMount } from "@monaco-editor/react";
import { styled } from "next-yak";
import { fonts, fontSize, light, dark, ink, status } from "@/tokens";
import { focusRing } from "@/lib/mixins";
import { EditorSwitcher } from "@/components/editor-switcher";
import { useCopy } from "@/lib/use-copy";
import { compressWithDictionary, decompressWithDictionary } from "@/lib/playground/compress";
import { defaultFiles } from "@/lib/playground/examples";
import { useCompiler } from "@/lib/playground/use-compiler";
import type { PlaygroundFile, TransformOptions } from "@/lib/playground/types";
import { SourceEditor } from "./source-editor";
import { Preview } from "./preview";
import { OutputView } from "./output-view";
import { OptionsMenu } from "./options-menu";
import {
  Card,
  Column,
  EditorBody,
  Header,
  OutputBody,
  PanelLabel,
  PreviewBody,
  PreviewCard,
  PreviewHeader,
  Spacer,
  StatusPill,
  Workspace,
} from "./layout";

/** the old playground allowed three files beside the main one, and share links rely on it */
const MAX_EXTRA_FILES = 3;

/** CSS: the extracted styles. JSX: the yak transform with the JSX kept. JS: the JSX compiled too. */
const OUTPUT_KINDS = ["css", "jsx", "js"] as const;
type OutputKind = (typeof OUTPUT_KINDS)[number];

const defaultOptions: TransformOptions = { minify: false, showComments: true, foldStatic: true };

/**
 * The playground: a Monaco editor, a live preview and the compiled output, all in the
 * browser. Nothing needs a server, so the page works on a static host such as GitHub Pages.
 *
 * A share link keeps the files in `?q=`. The page is static, so the link is read here in the
 * browser, not on the server.
 */
export default function Playground() {
  // this component renders in the browser only (see playground-loader), so the first
  // state can read the share link straight from the URL
  const [initial] = useState(readShareLink);
  const [files, setFiles] = useState<PlaygroundFile[]>(initial.files);
  const [resetKey, setResetKey] = useState(0);
  const [activeFile, setActiveFile] = useState(initial.files[0].name);
  const [options, setOptions] = useState(defaultOptions);
  const [outputKind, setOutputKind] = useState<OutputKind>(initial.output);
  const [notice, setNotice] = useState<string | null>(initial.notice);
  const [compiler, compile] = useCompiler();
  const { copied, copy } = useCopy(2000);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const load = useCallback((next: PlaygroundFile[]) => {
    setFiles(next);
    setActiveFile(next[0].name);
    setResetKey((key) => key + 1);
  }, []);

  // compile after a short pause in typing
  useEffect(() => {
    const timer = setTimeout(() => compile(files, options), 200);
    return () => clearTimeout(timer);
  }, [files, options, compile]);

  const onChange = useCallback((name: string, content: string) => {
    setFiles((current) =>
      current.map((file) => (file.name === name ? { ...file, content } : file)),
    );
  }, []);

  const share = useCallback(() => {
    // empty extra files stay out of the link, so it stays short; they come back on load
    const record = Object.fromEntries(
      files
        .filter((file, index) => index === 0 || file.content.trim() !== "")
        .map((file) => [file.name, file.content]),
    );
    const url = new URL(window.location.href);
    url.search = new URLSearchParams({
      q: compressWithDictionary(record),
      output: outputKind,
    }).toString();
    window.history.replaceState(null, "", url);
    void copy(url.toString());
  }, [files, outputKind, copy]);

  const reset = () => {
    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState(null, "", url);
    setNotice(null);
    load(defaultFiles);
  };

  const format = () => void editorRef.current?.getAction("editor.action.formatDocument")?.run();

  const output = compiler.files.find((file) => file.name === activeFile);
  const sheets = useMemo(() => compiler.files.map((file) => file.css), [compiler.files]);
  const fileTabs = files.map((file) => ({ value: file.name, node: `${file.name}.tsx` }));

  return (
    <>
      {notice ? <Notice role="status">{notice}</Notice> : null}

      <Workspace>
        <Card data-ink>
          <Header>
            <EditorSwitcher
              value={activeFile}
              onValueChange={setActiveFile}
              items={fileTabs}
              ariaLabel="File"
            />
            <Spacer />
            <HeaderButton type="button" onClick={format} title="Format (prettier)">
              Format
            </HeaderButton>
            <HeaderButton type="button" onClick={reset} title="Back to the default example">
              Reset
            </HeaderButton>
            <HeaderButton
              type="button"
              onClick={share}
              data-copied={copied || undefined}
              title="Copy a link with this code (Cmd/Ctrl+S)"
            >
              {copied ? "Copied" : "Share"}
            </HeaderButton>
          </Header>
          <EditorBody>
            <Suspense fallback={<Loading>Loading the editor…</Loading>}>
              <SourceEditor
                files={files}
                activeFile={activeFile}
                resetKey={resetKey}
                onChange={onChange}
                onShortcutShare={share}
                editorRef={editorRef}
              />
            </Suspense>
          </EditorBody>
        </Card>

        <Column>
          <PreviewCard>
            <PreviewHeader>
              <PanelLabel>Preview</PanelLabel>
              <StatusPill data-state={compiler.error ? "error" : compiler.status}>
                {compiler.error ? "Error" : compiler.status === "loading" ? "Loading compiler" : "Live"}
              </StatusPill>
            </PreviewHeader>
            <PreviewBody>
              <Preview Component={compiler.Component} sheets={sheets} />
            </PreviewBody>
          </PreviewCard>

          <Card data-ink>
            <Header>
              <EditorSwitcher
                value={outputKind}
                onValueChange={(value) => setOutputKind(value as OutputKind)}
                items={[
                  { value: "css", node: "CSS" },
                  { value: "jsx", node: "JSX" },
                  { value: "js", node: "JS" },
                ]}
                ariaLabel="Output"
              />
              <OutputFile>{activeFile}.tsx</OutputFile>
              <OptionsMenu options={options} onChange={setOptions} />
            </Header>
            {compiler.error ? <ErrorBanner role="alert">{compiler.error}</ErrorBanner> : null}
            <OutputBody>
              <OutputView
                code={output?.[outputKind] ?? ""}
                lang={outputKind === "css" ? "css" : "tsx"}
              />
            </OutputBody>
          </Card>
        </Column>
      </Workspace>
    </>
  );
}

/**
 * A link carries the files in `q` and the output tab in `output` (css, jsx or js). Share
 * keeps the tab on screen, so the reader of a link sees what its author saw. Old links have
 * no `output` and open on CSS.
 */
function readShareLink(): {
  files: PlaygroundFile[];
  output: OutputKind;
  notice: string | null;
} {
  const params = new URLSearchParams(window.location.search);
  const output = OUTPUT_KINDS.find((kind) => kind === params.get("output")) ?? "css";
  const q = params.get("q");
  if (!q) return { files: defaultFiles, output, notice: null };
  try {
    return { files: filesFromRecord(decompressWithDictionary(q)), output, notice: null };
  } catch {
    return {
      files: defaultFiles,
      output,
      notice: "This share link could not be read. The playground shows the default example.",
    };
  }
}

/**
 * Empty tabs for a link with fewer files, for example one with only `index`: a normal
 * module and a `.yak` file, so the reader can split code up without making files.
 */
const SPARE_FILES = ["components", "tokens.yak"];
const MIN_EXTRA_FILES = 2;

/** Share links store a record. The main file is always `index`, and it comes first. */
function filesFromRecord(record: Record<string, string>): PlaygroundFile[] {
  if (typeof record.index !== "string") throw new Error("no index file");
  const extras = Object.entries(record)
    .filter(([name]) => name !== "index" && !name.includes("node_modules") && !name.endsWith(".d.ts"))
    .slice(0, MAX_EXTRA_FILES)
    .map(([name, content]) => ({ name, content }));
  for (const name of SPARE_FILES) {
    if (extras.length >= MIN_EXTRA_FILES) break;
    if (!extras.some((file) => file.name === name)) extras.push({ name, content: "" });
  }
  return [{ name: "index", content: record.index }, ...extras];
}

const Notice = styled.p`
  margin: 0 0 20px;
  padding: 10px 14px;
  border-radius: 10px;
  background: color-mix(in srgb, ${status.warn} 16%, transparent);
  color: light-dark(${light.violet}, ${dark.white});
  font-size: ${fontSize.small};
`;




const HeaderButton = styled.button`
  padding: 6px 10px;
  border: 1px solid ${ink.border};
  border-radius: 6px;
  background: transparent;
  color: ${ink.fgSubtle};
  font-family: ${fonts.mono};
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background: ${ink.hover};
    color: ${ink.fg};
  }

  &[data-copied] {
    border-color: ${ink.success};
    color: ${ink.success};
  }

  &:focus-visible {
    ${focusRing};
    --focus-ring: ${ink.success};
    --focus-ring-offset: 1px;
  }
`;

const Loading = styled.p`
  margin: 0;
  padding: 16px;
  color: ${ink.fgMuted};
  font-family: ${fonts.mono};
  font-size: 13px;
`;




const OutputFile = styled.span`
  margin-left: auto;
  color: ${ink.fgMuted};
  font-family: ${fonts.mono};
  font-size: 13px;
`;

const ErrorBanner = styled.pre`
  margin: 0;
  padding: 10px 14px;
  white-space: pre-wrap;
  border-bottom: 1px solid ${ink.border};
  background: color-mix(in srgb, ${status.error} 22%, transparent);
  color: ${ink.fg};
  font-family: ${fonts.mono};
  font-size: 12px;
  line-height: 1.5;
`;

