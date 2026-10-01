import type { CSSProperties } from "react";
import { highlightPromise } from "@/lib/shiki";
import { frameworks, type Framework } from "./frameworks";
import FeatureShowcaseView, { type Callout } from "./feature-showcase-view";

const codeFor = ({ pkg, params, read }: Framework) => `import { styled, css } from "${pkg}";
import { Icon } from "./Icon";

const Button = styled.button<{
  $primary?: boolean;
}>\`
  font-size: 1.5em;
  color: palevioletred;

  &:hover {
    color: red;
  }

  \${Icon}:hover & {
    color: blue;
  }

  \${${params} =>
    ${read} &&
    css\`
      background: blue;
      color: white;
    \`}
\`;`;

type CalloutSpec = Omit<Callout, "snippetHtml"> & {
  /** What the card shows without the editor. Defaults to the annotated lines. */
  card?: { line: number; span: number } | { code: string };
};

// `line`/`span` are 1-based lines of the snippet above; keep them in sync with it.
const CALLOUTS: readonly CalloutSpec[] = [
  {
    side: "left",
    line: 1,
    span: 2,
    // without `css` so it fits a phone-width card
    card: { code: frameworks.map((f) => `import { styled } from "${f.pkg}";`).join("\n") },
    title: "Framework-agnostic",
    description: "Swap the import for Solid or Qwik. Props stay idiomatic.",
  },
  {
    side: "right",
    line: 4,
    span: 3,
    title: "Type-safe props",
    description: "A bad prop is a compile error, not a runtime surprise.",
  },
  {
    side: "left",
    line: 10,
    span: 3,
    title: "Real CSS",
    description: "Nesting and pseudo-selectors, not a subset.",
  },
  {
    side: "right",
    line: 14,
    span: 3,
    title: "Target other components",
    description: "Reference another styled component directly.",
  },
  {
    side: "left",
    line: 18,
    span: 2,
    card: { line: 18, span: 6 },
    title: "Prop interpolation",
    description: "Props flow straight into your styles.",
  },
  {
    side: "right",
    // anchored below the css`` opener so it clears the card above on the narrowest annotated layout
    line: 21,
    span: 3,
    card: { line: 20, span: 4 },
    title: "The css helper",
    description: "Compose conditional style blocks.",
  },
];

type Highlighted = { open: string; lines: string[]; close: string };
type Snippet = { html: string; text: string[] };

function splitLines(html: string): Highlighted {
  const start = html.indexOf("<code>") + "<code>".length;
  const end = html.lastIndexOf("</code>");
  return {
    open: html.slice(0, start),
    lines: html.slice(start, end).split("\n"),
    close: html.slice(end),
  };
}

// Shiki folds leading whitespace into the first token's span, right after the opening tags.
function dedentLine(lineHtml: string, indent: number): string {
  return lineHtml.replace(
    /^((?:<span[^>]*>)+)( +)/,
    (_, tags: string, spaces: string) => tags + spaces.slice(indent),
  );
}

function minIndent(rows: string[]): number {
  return Math.min(...rows.filter((l) => l.trim() !== "").map((l) => /^ */.exec(l)![0].length));
}

function sliceFor(
  { line, span }: { line: number; span: number },
  highlighted: Highlighted,
  source: string[],
): Snippet {
  const slice = <T,>(rows: T[]) => rows.slice(line - 1, line - 1 + span);
  const indent = minIndent(slice(source));
  const html = slice(highlighted.lines).map((l) => dedentLine(l, indent));

  return {
    html: highlighted.open + html.join("\n") + highlighted.close,
    text: slice(source).map((l) => l.slice(indent)),
  };
}

export default async function FeatureShowcase({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const highlight = await highlightPromise;
  const codeByTab = Object.fromEntries(frameworks.map((f) => [f.id, highlight(codeFor(f), "tsx")]));

  // Card slices come from the React variant; the cards do not switch frameworks.
  const source = codeFor(frameworks[0]).split("\n");
  const highlighted = splitLines(codeByTab[frameworks[0].id]);
  const snippets: Snippet[] = CALLOUTS.map(({ card, ...callout }) =>
    card && "code" in card
      ? { html: highlight(card.code, "tsx"), text: card.code.split("\n") }
      : sliceFor(card ?? callout, highlighted, source),
  );
  const callouts: Callout[] = CALLOUTS.map(({ card: _card, ...callout }, i) => ({
    ...callout,
    snippetHtml: snippets[i].html,
  }));
  const codeCols = Math.max(...snippets.flatMap((s) => s.text.map((l) => l.length)));

  return (
    <FeatureShowcaseView
      codeByTab={codeByTab}
      lineCount={source.length}
      codeCols={codeCols}
      callouts={callouts}
      className={className}
      style={style}
    />
  );
}
