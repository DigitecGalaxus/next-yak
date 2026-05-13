import { importHeader, libs, styledIdentFor, writeBenchmarkSource } from "../_shared.ts";

// Ported from styled-components/packages/benchmarks/src/cases/SierpinskiTriangle.tsx.
// Recursively renders 3^5 = 243 Dot components; each Dot has dynamic
// position/size/color styles to exercise per-instance style computation.
// Random color sampling is replaced with a deterministic index-based palette
// so iterations are reproducible (no Math.random).
const initialSize = 256;
const targetSize = 10;

for (const lib of libs) {
  const styled = styledIdentFor(lib);

  const fileContent = `
"use client";
import React, { type FunctionComponent } from 'react';
${importHeader(lib, /* withCss */ false)}

const View = ${styled}.div\`
  align-items: stretch;
  border-width: 0;
  border-style: solid;
  box-sizing: border-box;
  display: flex;
  flex-basis: auto;
  flex-direction: column;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
  position: relative;
  min-height: 0;
  min-width: 0;
\`;

interface DotProps {
  $color: string;
  $size: number;
  $x: number;
  $y: number;
}

// Mirrors styled-components benchmark Dot: dynamic position/size, plus
// a per-instance border color injected via inline style (cheap to update).
const Dot = ${styled}(View).attrs<DotProps>((p) => ({
  style: { borderBottomColor: p.$color },
}))\`
  position: absolute;
  cursor: pointer;
  width: 0;
  height: 0;
  border-color: transparent;
  border-style: solid;
  border-top-width: 0;
  transform: translate(50%, 50%);
  margin-left: \${(p) => \`\${p.$x}px\`};
  margin-top: \${(p) => \`\${p.$y}px\`};
  border-right-width: \${(p) => \`\${p.$size / 2}px\`};
  border-bottom-width: \${(p) => \`\${p.$size / 2}px\`};
  border-left-width: \${(p) => \`\${p.$size / 2}px\`};
\`;

const targetSize = ${targetSize};

// Deterministic palette so benchmark iterations are reproducible.
const palette = [
  '#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8',
  '#807dba', '#6a51a3', '#54278f', '#3f007d',
];
const colorFor = (depth: number, n: number) =>
  palette[(depth * 3 + n) % palette.length];

interface SierpinskiProps {
  s: number;
  x: number;
  y: number;
  depth?: number;
  n?: number;
}

const Sierpinski: FunctionComponent<SierpinskiProps> = ({
  s,
  x,
  y,
  depth = 0,
  n = 0,
}) => {
  if (s <= targetSize) {
    return (
      <Dot
        $color={colorFor(depth, n)}
        $size={targetSize}
        $x={x - targetSize / 2}
        $y={y - targetSize / 2}
      />
    );
  }
  const next = s / 2;
  return (
    <>
      <Sierpinski depth={1} n={n} s={next} x={x} y={y - next / 2} />
      <Sierpinski depth={2} n={n} s={next} x={x - next} y={y + next / 2} />
      <Sierpinski depth={3} n={n} s={next} x={x + next} y={y + next / 2} />
    </>
  );
};

export const Sierpinski${lib === "next-yak" ? "Yak" : "Styled"}: FunctionComponent = () => (
  <Sierpinski s={${initialSize}} x={0} y={0} />
);
`;

  writeBenchmarkSource("Sierpinski", lib, fileContent);
}
