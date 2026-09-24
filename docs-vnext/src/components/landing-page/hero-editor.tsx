import type { CSSProperties } from "react";
import { highlightPromise } from "@/lib/shiki";
import HeroEditorView from "./hero-editor-view";
import { frameworks, type Framework } from "./frameworks";

const codeFor = ({ pkg, params, read }: Framework) => `import { styled, css } from "${pkg}";

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

export default async function HeroEditor({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const highlight = await highlightPromise;
  const codeByTab = Object.fromEntries(frameworks.map((f) => [f.id, highlight(codeFor(f), "tsx")]));

  return <HeroEditorView codeByTab={codeByTab} className={className} style={style} />;
}
