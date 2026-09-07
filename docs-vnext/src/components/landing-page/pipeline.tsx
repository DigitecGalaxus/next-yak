import type { CSSProperties } from "react";
import { highlighterPromise, yakTheme } from "@/lib/shiki";
import PipelineView, { type Band, type Host } from "./pipeline-view";
import { NextIcon, RspackIcon, ViteIcon } from "./framework-icons";
import { StorybookIcon } from "./tool-icons";

const INPUT = `const Button = styled.button\`
  font-size: 1.5em;
  color: palevioletred;
  &:hover { color: red; }
\`;`;

const OUTPUT_CSS = `.button_x7a {
  font-size: 1.5em;
  color: palevioletred;
}
.button_x7a:hover { color: red; }`;

// The JS pane is a diff: the stylesheet import arrives, the template leaves, and the
// component keeps only a class reference. Deliberately schematic (the real output goes
// through yak's internal runtime); the point is what leaves the bundle and what stays.
const OUTPUT_JS = `import "./Button.css";
const Button = styled.button\`
  font-size: 1.5em;
  color: palevioletred;
  &:hover { color: red; }
\`;
const Button = styled.button("button_x7a");`;
const JS_DIFF: Record<number, "add" | "remove"> = {
  1: "add",
  2: "remove",
  3: "remove",
  4: "remove",
  5: "remove",
  6: "remove",
  7: "add",
};

// The bundlers the plugin runs inside, each with the config that wires it in. Same
// input, same output whichever you pick; only this file changes.
const HOSTS = [
  {
    id: "next",
    label: "Next.js",
    Icon: NextIcon,
    file: "next.config.ts",
    code: `import { withYak } from "@yak/react/withYak";

export default withYak({
  // your Next.js config
});`,
  },
  {
    id: "vite",
    label: "Vite",
    Icon: ViteIcon,
    file: "vite.config.ts",
    code: `import { viteYak } from "@yak/react/vite";

export default defineConfig({
  plugins: [viteYak(), react()],
});`,
  },
  {
    id: "rsbuild",
    label: "Rsbuild",
    Icon: RspackIcon,
    file: "rsbuild.config.ts",
    code: `import { pluginYak } from "@yak/react/rsbuild";

export default defineConfig({
  plugins: [pluginReact(), pluginYak()],
});`,
  },
  {
    id: "storybook",
    label: "Storybook",
    Icon: StorybookIcon,
    file: ".storybook/main.ts",
    code: `export default {
  framework: "@storybook/react-vite",
  addons: ["storybook-addon-yak"],
};`,
  },
] as const;

// The scroll tour lights up what belongs together, one turn at a time, walking the
// input top to bottom: the component and the class reference plus import that replace
// it, the static declarations where they went, then the nested selector and its
// flattened rule. 1-based lines of each pane.
const TURNS = 3;
const BANDS: Record<"input" | "css" | "js", Band[]> = {
  input: [
    { line: 1, span: 1, turn: 0 },
    { line: 2, span: 2, turn: 1 },
    { line: 4, span: 1, turn: 2 },
  ],
  js: [
    { line: 1, span: 2, turn: 0 },
    { line: 7, span: 1, turn: 0 },
    { line: 3, span: 2, turn: 1 },
    { line: 5, span: 1, turn: 2 },
  ],
  css: [
    { line: 1, span: 1, turn: 0 },
    { line: 2, span: 2, turn: 1 },
    { line: 5, span: 1, turn: 2 },
  ],
};

/** Tag shiki's line spans with the diff marks so the pane can paint them. */
function markDiff(html: string, marks: Record<number, "add" | "remove">): string {
  let n = 0;
  return html.replaceAll('<span class="line">', () => {
    const mark = marks[++n];
    return mark ? `<span class="line" data-diff="${mark}">` : '<span class="line">';
  });
}

/**
 * "How it works" as the pipeline it is: Button.tsx and your bundler config go in, the
 * plugin sits in the middle, and two things come out, a real stylesheet and the same JS
 * with the template swapped for a class reference (shown as a diff). A switch picks the
 * bundler; only the config pane and the chip's caption change, which is the point.
 * Highlighting happens here on the server; pipeline-view.tsx holds the switch state and
 * the layout.
 */
export default async function Pipeline({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const highlighter = await highlighterPromise;
  const highlight = (code: string, lang: string) =>
    highlighter.codeToHtml(code, { lang, theme: yakTheme.name });
  const lines = (code: string) => code.split("\n").length;
  // lines the diff adds before the removed block; the input pane shifts down by as many
  // so its lines sit level with the ones they became
  const inOffset =
    Math.min(...Object.entries(JS_DIFF).flatMap(([n, m]) => (m === "remove" ? [+n] : []))) - 1;

  const hosts: Host[] = HOSTS.map((h) => ({
    id: h.id,
    label: h.label,
    file: h.file,
    tab: (
      <>
        <h.Icon mono />
        {h.label}
      </>
    ),
    configHtml: highlight(h.code, "ts"),
  }));

  return (
    <PipelineView
      hosts={hosts}
      input={{ html: highlight(INPUT, "tsx"), lines: lines(INPUT), offset: inOffset }}
      stylesheet={{ html: highlight(OUTPUT_CSS, "css"), lines: lines(OUTPUT_CSS) }}
      js={{ html: markDiff(highlight(OUTPUT_JS, "tsx"), JS_DIFF), lines: lines(OUTPUT_JS) }}
      bands={BANDS}
      turns={TURNS}
      className={className}
      style={style}
    />
  );
}
