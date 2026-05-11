import {
  conditionalDecl,
  importHeader,
  libs,
  styledIdentFor,
  writeBenchmarkSource,
} from "../_shared.ts";

// Six sequential SSR mounts of a parent with 200 stable-prop styled children.
// Only the parent's `count` differs across mounts (ends up in `data-count`
// on the wrapper). Exercises each library's cross-render style cache:
// styled-components hits its prop-tuple class hash cache, yak recomputes
// class composition each mount.
const childCount = 200;
const renderCount = 6;

for (const lib of libs) {
  const styled = styledIdentFor(lib);

  // Conditional CSS rules need each library's idiomatic API
  // (see comment in tree/gen.ts).
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
  flex-direction: column;
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
}

const Box = ${styled}(View)<BoxProps>\`
  align-self: flex-start;
  flex-direction: \${(p) => (p.$layout === 'column' ? 'column' : 'row')};
  padding: \${(p) => (p.$outer ? '4px' : '0')};
  ${fixedHeight}
  ${fixedWidth}
  background-color: \${(p) => getColor(p.$color ?? -1)};
\`;

const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignContent: 'flex-start',
  width: '100%',
  height: '100%',
};

const CHILD_COUNT = ${childCount};

interface ParentProps {
  count: number;
}

// Children receive STABLE props determined by index only. Only the parent's
// \`count\` prop changes between renders (data-count attribute on the wrapper).
const Parent: FunctionComponent<ParentProps> = ({ count }) => {
  const children = [] as React.ReactElement[];
  for (let i = 0; i < CHILD_COUNT; i++) {
    children.push(
      <Box
        key={i}
        $color={i % 6}
        $layout={i % 2 === 0 ? 'column' : 'row'}
        $outer={i % 3 === 0}
        $fixed={i % 5 === 0}
      />,
    );
  }
  return (
    <div data-count={count} style={wrapperStyle}>
      {children}
    </div>
  );
};

export const RENDER_COUNT = ${renderCount};
export const CrossRequestCache${
    lib === "next-yak" ? "Yak" : "Styled"
  }: FunctionComponent<{ count: number }> = ({ count }) => (
  <Parent count={count} />
);
`;

  writeBenchmarkSource("CrossRequestCache", lib, fileContent);
}
