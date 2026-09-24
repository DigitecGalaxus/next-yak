import type { CSSProperties } from "react";
import { highlightPromise } from "@/lib/shiki";
import PipelineView, { type Band, type Host } from "./pipeline-view";
import { NextIcon, RsbuildIcon, StorybookIcon, ViteIcon } from "./framework-icons";

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

// Schematic: the real output goes through yak's internal runtime.
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
    Icon: RsbuildIcon,
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

// Lines (1-based) of each pane that light up together in each scroll-tour turn.
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

function markDiff(html: string, marks: Record<number, "add" | "remove">): string {
  let n = 0;
  return html.replaceAll('<span class="line">', () => {
    const mark = marks[++n];
    return mark ? `<span class="line" data-diff="${mark}">` : '<span class="line">';
  });
}

export default async function Pipeline({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const highlight = await highlightPromise;
  const lines = (code: string) => code.split("\n").length;
  // lines the diff adds before the removed block, so the input pane can sit level with it
  const inOffset =
    Math.min(...Object.entries(JS_DIFF).flatMap(([n, m]) => (m === "remove" ? [+n] : []))) - 1;

  const hosts: Host[] = HOSTS.map((h) => ({
    id: h.id,
    label: h.label,
    file: h.file,
    tab: (
      <>
        <h.Icon />
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
      js={{ html: markDiff(highlight(OUTPUT_JS, "tsx"), JS_DIFF) }}
      bands={BANDS}
      turns={TURNS}
      className={className}
      style={style}
    />
  );
}
