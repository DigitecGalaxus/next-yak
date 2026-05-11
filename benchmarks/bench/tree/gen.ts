import {
  conditionalDecl,
  importHeader,
  libs,
  styledIdentFor,
  writeBenchmarkSource,
} from "../_shared.ts";

// Ported from styled-components/packages/benchmarks/src/cases/Tree.tsx.
// Recursive tree of Box components with breadth ** depth leaves
// (5^4 = 625 leaves, wrapped twice, ~1875 Boxes total). Mount-time cost
// of generating styles for many components.
const breadth = 5;
const depth = 4;
const wrap = 2;

for (const lib of libs) {
  const styled = styledIdentFor(lib);

  // Conditional CSS *rules* (whole declarations toggled on a prop) must use
  // the host library's idiomatic API:
  //   - styled-components: `${p => p.fixed && 'height: 6px;'}` (raw string).
  //   - next-yak: `${p => p.$fixed && css`height: 6px;`}` (css tag, so the
  //     compiler extracts a class and the runtime just toggles it).
  // Mixing them up makes the comparison meaningless: yak silently drops raw
  // strings, and styled-components doesn't need css`` here.
  const cond = conditionalDecl(lib);
  const fixedHeight = cond("p.$fixed", "height: 6px;");
  const fixedWidth = cond("p.$fixed", "width: 6px;");

  const fileContent = `
"use client";
import React, { type FunctionComponent } from 'react';
${importHeader(lib)}

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

const getColor = (color: number) => {
  switch (color) {
    case 0: return '#14171A';
    case 1: return '#AAB8C2';
    case 2: return '#E6ECF0';
    case 3: return '#FFAD1F';
    case 4: return '#F45D22';
    case 5: return '#E0245E';
    default: return 'transparent';
  }
};

interface BoxProps {
  $color?: number;
  $layout?: 'column' | 'row';
  $outer?: boolean;
  $fixed?: boolean;
  children?: React.ReactNode;
}

const Box = ${styled}(View)<BoxProps>\`
  align-self: flex-start;
  flex-direction: \${(p) => (p.$layout === 'column' ? 'column' : 'row')};
  padding: \${(p) => (p.$outer ? '4px' : '0')};
  ${fixedHeight}
  ${fixedWidth}
  background-color: \${(p) => getColor(p.$color ?? -1)};
\`;

interface TreeProps {
  breadth: number;
  depth: number;
  id: number;
  wrap: number;
}

const Tree: FunctionComponent<TreeProps> = ({ breadth, depth, id, wrap }) => {
  let result = (
    <Box $color={id % 3} $layout={depth % 2 === 0 ? 'column' : 'row'} $outer>
      {depth === 0 && <Box $color={(id % 3) + 3} $fixed />}
      {depth !== 0 &&
        Array.from({ length: breadth }).map((_, i) => (
          <Tree
            breadth={breadth}
            depth={depth - 1}
            id={i}
            key={i}
            wrap={wrap}
          />
        ))}
    </Box>
  );
  for (let i = 0; i < wrap; i++) {
    result = <Box>{result}</Box>;
  }
  return result;
};

export const Tree${lib === "next-yak" ? "Yak" : "Styled"}: FunctionComponent = () => (
  <Tree breadth={${breadth}} depth={${depth}} id={0} wrap={${wrap}} />
);
`;

  writeBenchmarkSource("Tree", lib, fileContent);
}
