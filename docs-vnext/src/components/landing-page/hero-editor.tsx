import type { CSSProperties } from "react";
import { highlighterPromise, yakTheme } from "@/lib/shiki";
import HeroEditorView from "./hero-editor-view";
import { frameworks } from "./frameworks";

const TABS = frameworks.map((f) => f.pkg);

// Only the import line differs between frameworks; everything else is identical.
const codeFor = (pkg: string) => `import { styled, css } from "${pkg}";

const Button = styled.button<{ $primary?: boolean }>\`
  font-size: 1.5em;
  color: palevioletred;

  &:hover {
    color: red;
  }

  \${({ $primary }) =>
    $primary &&
    css\`
      background: blue;
      color: white;
    \`}
  \`;
`;

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
      tab,
      highlighter.codeToHtml(codeFor(tab), { lang: "tsx", theme: yakTheme.name }),
    ]),
  );

  return <HeroEditorView tabs={TABS} codeByTab={codeByTab} className={className} style={style} />;
}
