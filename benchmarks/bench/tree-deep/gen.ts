import {
  conditionalDecl,
  importHeader,
  libs,
  styledIdentFor,
  writeBenchmarkSource,
} from "../_shared.ts";

// Same Box+View shape as Tree, but breadth=2 / depth=9 (~1535 Boxes, React
// render depth ~10). Cost is dominated by recursive component rendering
// rather than sibling fan-out. Pair with TreeWide for the opposite shape.
const breadth = 2;
const depth = 9;
const wrap = 0;

for (const lib of libs) {
  const styled = styledIdentFor(lib);
  const isYak = lib === "next-yak";

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

export const TreeDeep${isYak ? "Yak" : "Styled"}: FunctionComponent = () => (
  <Tree breadth={${breadth}} depth={${depth}} id={0} wrap={${wrap}} />
);
`;

  writeBenchmarkSource("TreeDeep", lib, fileContent);
}
