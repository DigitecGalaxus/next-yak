"use client";

import { Suspense, use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OnMount } from "@monaco-editor/react";
import { styled } from "next-yak";
import { fonts, fontSize, light, dark, ink, status } from "@/tokens";
import { EditorSwitcher } from "@/components/editor-switcher";
import { useCopy } from "@/lib/use-copy";
import { highlightPromise } from "@/lib/shiki";
import { compressWithDictionary, decompressWithDictionary } from "@/lib/playground/compress";
import { examples } from "@/lib/playground/examples";
import { DEFAULT_FRAMEWORK, isFrameworkId, type FrameworkId } from "@/lib/playground/frameworks";
import { useCompiler } from "@/lib/playground/use-compiler";
import type { PlaygroundFile, TransformOptions } from "@/lib/playground/types";
import { FRAMEWORK_TABS } from "@/components/landing-page/frameworks";
import { EditorDots } from "@/components/landing-page/editor-dots";
import { SourceEditor } from "./source-editor";
import { Preview } from "./preview";
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
  HeaderButton,
  PackageName,
  StatusPill,
  TitleBar,
  Workspace,
} from "./layout";

/** the old playground allowed three files beside the main one, and share links rely on it */
const MAX_EXTRA_FILES = 3;

const OUTPUT_KINDS = ["css", "jsx", "js"] as const;
type OutputKind = (typeof OUTPUT_KINDS)[number];

const defaultOptions: TransformOptions = { minify: false, showComments: true, foldStatic: true };

const frameworkTabs = FRAMEWORK_TABS.filter((tab) => isFrameworkId(tab.value));

export default function Playground() {
  // the page is a static export, so the share link is read here in the browser
  const [initial] = useState(readShareLink);
  const [framework, setFramework] = useState<FrameworkId>(initial.framework);
  const [files, setFiles] = useState<PlaygroundFile[]>(initial.files);
  // the edits in each framework, so a switch back finds them again
  const drafts = useRef<Partial<Record<FrameworkId, PlaygroundFile[]>>>({});
  const [resetKey, setResetKey] = useState(0);
  const [activeFile, setActiveFile] = useState(initial.files[0].name);
  const [options, setOptions] = useState(defaultOptions);
  const [outputKind, setOutputKind] = useState<OutputKind>(initial.output);
  const [notice, setNotice] = useState<string | null>(initial.notice);
  const [compiler, compile] = useCompiler();
  const { copied, copy } = useCopy(2000);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => compile(framework, files, options), 200);
    return () => clearTimeout(timer);
  }, [framework, files, options, compile]);

  const onChange = useCallback((name: string, content: string) => {
    setFiles((current) =>
      current.map((file) => (file.name === name ? { ...file, content } : file)),
    );
  }, []);

  const share = useCallback(() => {
    const record = Object.fromEntries(
      files
        .filter((file, index) => index === 0 || file.content.trim() !== "")
        .map((file) => [file.name, file.content]),
    );
    const url = new URL(window.location.href);
    url.search = new URLSearchParams({
      q: compressWithDictionary(record),
      output: outputKind,
      // links from before the framework switch have no framework and open in React
      ...(framework === DEFAULT_FRAMEWORK ? {} : { framework }),
    }).toString();
    window.history.replaceState(null, "", url);
    void copy(url.toString());
  }, [framework, files, outputKind, copy]);

  /** Shows `next` in the editor. The share link in the address bar no longer matches it. */
  const showFiles = (nextFramework: FrameworkId, next: PlaygroundFile[]) => {
    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState(null, "", url);
    setNotice(null);
    setFramework(nextFramework);
    setFiles(next);
    setActiveFile(next[0].name);
    setResetKey((key) => key + 1);
  };

  const reset = () => {
    delete drafts.current[framework];
    showFiles(framework, examples[framework]);
  };

  const switchFramework = (next: string) => {
    if (!isFrameworkId(next) || next === framework) return;
    drafts.current[framework] = files;
    showFiles(next, drafts.current[next] ?? examples[next]);
  };

  const format = () => void editorRef.current?.getAction("editor.action.formatDocument")?.run();

  const output = compiler.files.find((file) => file.name === activeFile);
  const sheets = useMemo(() => compiler.files.map((file) => file.css), [compiler.files]);
  const fileTabs = files.map((file) => ({ value: file.name, node: `${file.name}.tsx` }));

  return (
    <>
      {notice ? <Notice role="status">{notice}</Notice> : null}

      <Workspace>
        <Card>
          <TitleBar>
            <EditorDots />
            <PackageName>@yak/{framework}</PackageName>
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
          </TitleBar>
          <Header>
            <EditorSwitcher
              value={activeFile}
              onValueChange={setActiveFile}
              items={fileTabs}
              ariaLabel="File"
              pair
            />
            <Spacer />
            <EditorSwitcher
              value={framework}
              onValueChange={switchFramework}
              items={frameworkTabs}
              ariaLabel="Framework"
              pair
            />
          </Header>
          <EditorBody>
            <Suspense fallback={<Loading>Loading the editor…</Loading>}>
              <SourceEditor
                framework={framework}
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
              <Preview result={compiler.result} sheets={sheets} />
            </PreviewBody>
          </PreviewCard>

          <Card>
            <Header>
              <EditorSwitcher
                value={outputKind}
                onValueChange={(value) => setOutputKind(value as OutputKind)}
                items={OUTPUT_KINDS.map((kind) => ({ value: kind, node: kind.toUpperCase() }))}
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

function readShareLink(): {
  framework: FrameworkId;
  files: PlaygroundFile[];
  output: OutputKind;
  notice: string | null;
} {
  const params = new URLSearchParams(window.location.search);
  const output = OUTPUT_KINDS.find((kind) => kind === params.get("output")) ?? "css";
  const requested = params.get("framework");
  const framework = isFrameworkId(requested) ? requested : DEFAULT_FRAMEWORK;
  const q = params.get("q");
  if (!q) return { framework, files: examples[framework], output, notice: null };
  try {
    return { framework, files: filesFromRecord(decompressWithDictionary(q)), output, notice: null };
  } catch {
    return {
      framework,
      files: examples[framework],
      output,
      notice: "This share link could not be read. The playground shows the default example.",
    };
  }
}

/** empty tabs added to a link with fewer than MIN_EXTRA_FILES extra files */
const SPARE_FILES = ["components", "tokens.yak"];
const MIN_EXTRA_FILES = 2;

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

const Loading = styled.p`
  margin: 0;
  padding: 16px;
  color: ${ink.fgMuted};
  font-family: ${fonts.mono};
  font-size: 13px;
`;

function OutputView({ code, lang }: { code: string; lang: "css" | "tsx" }) {
  const highlight = use(highlightPromise);
  const html = useMemo(() => highlight(code || "/* no output */", lang), [highlight, code, lang]);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

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

