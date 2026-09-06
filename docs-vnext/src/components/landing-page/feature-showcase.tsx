import type { CSSProperties } from "react";
import { highlighterPromise, yakTheme } from "@/lib/shiki";
import { frameworks } from "./frameworks";
import { FRAMEWORK_TABS } from "./framework-tabs";
import FeatureShowcaseView, { type Callout } from "./feature-showcase-view";

const PROP_ACCESS: Record<string, { params: string; read: string }> = {
  react: { params: "({ $primary })", read: "$primary" },
  solid: { params: "(props)", read: "props.$primary" },
  qwik: { params: "({ $primary })", read: "$primary" },
};

const codeFor = (id: string, pkg: string) => {
  const { params, read } = PROP_ACCESS[id];
  return `import { styled, css } from "${pkg}";
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
};

type CalloutSpec = Omit<Callout, "snippetHtml"> & {
  /**
   * What the card shows on its own when the layout is too narrow for the editor: a line
   * range of the snippet (default: the annotated block) or standalone code of its own.
   */
  card?: { line: number; span: number } | { code: string };
};

// `line`/`span` are 1-based line numbers into the snippet above; keep them in sync when
// the snippet changes. Listed in reading order, top to bottom.
const CALLOUTS: readonly CalloutSpec[] = [
  {
    side: "left",
    line: 1,
    span: 2,
    // the import line three ways, without `css` so it still fits a phone-width card
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
    // on its own the two-line anchor ends mid-expression; show the whole interpolation
    card: { line: 18, span: 6 },
    title: "Prop interpolation",
    description: "Props flow straight into your styles.",
  },
  {
    side: "right",
    // anchored on the block body rather than the css`` opener so the card keeps clear of
    // the "Target other components" card above it on the narrowest annotated layout
    line: 21,
    span: 3,
    card: { line: 20, span: 4 },
    title: "The css helper",
    description: "Compose conditional style blocks.",
  },
];

type Highlighted = { open: string; lines: string[]; close: string };
type Snippet = { html: string; text: string[] };

/**
 * Split shiki's output into its `<pre><code>` wrapper and one HTML string per source
 * line, so a card can show a slice of the editor's code with identical highlighting
 */
function splitLines(html: string): Highlighted {
  const start = html.indexOf("<code>") + "<code>".length;
  const end = html.lastIndexOf("</code>");
  return {
    open: html.slice(0, start),
    lines: html.slice(start, end).split("\n"),
    close: html.slice(end),
  };
}

/**
 * Drop `indent` leading spaces from a highlighted line. Shiki folds leading whitespace
 * into the first token's span, so the spaces sit right after the opening tags.
 */
function dedentLine(lineHtml: string, indent: number): string {
  return lineHtml.replace(
    /^((?:<span[^>]*>)+)( +)/,
    (_, tags: string, spaces: string) => tags + spaces.slice(indent),
  );
}

/** The common leading indent of a block, ignoring blank lines. */
function minIndent(rows: string[]): number {
  return Math.min(...rows.filter((l) => l.trim() !== "").map((l) => /^ */.exec(l)![0].length));
}

/** A card's slice of the editor code: the chosen line range, dedented to its own margin. */
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
  const highlighter = await highlighterPromise;
  // Highlight each framework variant once on the server; the client view swaps between
  // the pre-rendered HTML without shipping the highlighter.
  const highlight = (code: string) =>
    highlighter.codeToHtml(code, { lang: "tsx", theme: yakTheme.name });
  const codeByTab: Record<string, string> = Object.fromEntries(
    frameworks.map((f) => [f.id, highlight(codeFor(f.id, f.pkg))]),
  );

  // The card slices are cut from the first (React) variant; the cards don't switch
  // frameworks, and the one card about the differences brings its own code.
  const source = codeFor(frameworks[0].id, frameworks[0].pkg).split("\n");
  const highlighted = splitLines(codeByTab[frameworks[0].id]);
  const snippets: Snippet[] = CALLOUTS.map(({ card, ...callout }) =>
    card && "code" in card
      ? { html: highlight(card.code), text: card.code.split("\n") }
      : sliceFor(card ?? callout, highlighted, source),
  );
  const callouts: Callout[] = CALLOUTS.map(({ card: _card, ...callout }, i) => ({
    ...callout,
    snippetHtml: snippets[i].html,
  }));
  // widest card line, in characters: sizes the shared code column of the row layout
  const codeCols = Math.max(...snippets.flatMap((s) => s.text.map((l) => l.length)));

  return (
    <FeatureShowcaseView
      title="Button.tsx"
      tabs={FRAMEWORK_TABS}
      codeByTab={codeByTab}
      lineCount={source.length}
      codeCols={codeCols}
      callouts={callouts}
      className={className}
      style={style}
    />
  );
}
