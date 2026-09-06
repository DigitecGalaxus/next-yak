import type { CSSProperties } from "react";
import { highlighterPromise, yakTheme } from "@/lib/shiki";
import HeroEditorView from "./hero-editor-view";
import { frameworks } from "./frameworks";
import { FRAMEWORK_TABS as TABS } from "./framework-tabs";

// The same component per framework. Only the import and the prop interpolation change:
// React destructures its props, Solid reads them off the reactive `props` object.
const PROP_ACCESS: Record<string, { params: string; read: string }> = {
  react: { params: "({ $primary })", read: "$primary" },
  solid: { params: "(props)", read: "props.$primary" },
  qwik: { params: "({ $primary })", read: "$primary" },
};

const codeFor = (id: string) => {
  const { params, read } = PROP_ACCESS[id];
  return `import { styled, css } from "${frameworks.find((f) => f.id === id)?.pkg}";

const Button = styled.button<{ $primary?: boolean }>\`
  font-size: 1.5em;
  color: palevioletred;

  &:hover {
    color: red;
  }

  \${${params} =>
    ${read} &&
    css\`
      background: blue;
      color: white;
    \`}
  \`;
`;
};

export default async function HeroEditor({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const highlighter = await highlighterPromise;
  // Highlight each framework variant once on the server, then hand the HTML to the
  // client view, which swaps between them without shipping the highlighter.
  const codeByTab: Record<string, string> = Object.fromEntries(
    TABS.map((tab) => [
      tab.value,
      highlighter.codeToHtml(codeFor(tab.value), { lang: "tsx", theme: yakTheme.name }),
    ]),
  );

  return <HeroEditorView tabs={TABS} codeByTab={codeByTab} className={className} style={style} />;
}
