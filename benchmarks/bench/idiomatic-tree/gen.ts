import {
  branch,
  conditionalDecl,
  importHeader,
  libs,
  styledIdentFor,
  writeBenchmarkSource,
} from "../_shared.ts";

// This is the class-toggle counterpart to Tree.
// Same shape (~1875 Boxes, $layout / $outer / $fixed / $color props), but
// every dynamic value is rewritten as a class toggle (`${p => cond && css`...`}`)
// instead of a CSS-variable interpolation.
const breadth = 5;
const depth = 4;
const wrap = 2;

for (const lib of libs) {
  const styled = styledIdentFor(lib);
  const isYak = lib === "next-yak";

  const cond = conditionalDecl(lib);
  const switchProp = branch(lib);

  // 6 mutually-exclusive $color values collapse into a single ternary
  // chain - one function call per Box instead of six independent toggles.
  const colors = ["#14171A", "#AAB8C2", "#E6ECF0", "#FFAD1F", "#F45D22", "#E0245E"];
  const colorBranch = switchProp(
    colors.map((hex, i) => ({
      when: `p.$color === ${i}`,
      decls: `background-color: ${hex};`,
    })),
  );

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

interface BoxProps {
  $color?: number;
  $layout?: 'column' | 'row';
  $outer?: boolean;
  $fixed?: boolean;
  children?: React.ReactNode;
}

// All dynamic styling is class-toggle based: each branch is an extracted
// static class that gets composed onto the element by the runtime.
const Box = ${styled}(View)<BoxProps>\`
  align-self: flex-start;
  flex-direction: row;
  padding: 0;
  background-color: transparent;
  ${cond(`p.$layout === 'column'`, "flex-direction: column;")}
  ${cond(`p.$outer`, "padding: 4px;")}
  ${cond(`p.$fixed`, "height: 6px; width: 6px;")}
  ${colorBranch}
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

export const IdiomaticTree${isYak ? "Yak" : "Styled"}: FunctionComponent = () => (
  <Tree breadth={${breadth}} depth={${depth}} id={0} wrap={${wrap}} />
);
`;

  writeBenchmarkSource("IdiomaticTree", lib, fileContent);
}
