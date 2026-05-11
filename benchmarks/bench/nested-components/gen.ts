import { importHeader, libs, styledIdentFor, writeBenchmarkSource } from "../_shared.ts";

// 200 components extended through 5 levels of `styled(Parent)`. Tests the
// per-render cost of yak's extension chain (each layer forwards props and
// composes class names) versus styled-components' flattened render.
const componentCount = 200;

for (const lib of libs) {
  const styled = styledIdentFor(lib);

  const fileContent = `
"use client";
import React, { type FunctionComponent } from 'react';
${importHeader(lib, /* withCss */ false)}

// Base component
const BaseCard = ${styled}.div\`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
\`;

${Array.from({ length: componentCount }, (_, index) => {
  const baseColor = `#${(index + 1).toString(16).padStart(6, "0")}`;
  return `
// Level 1 - extends BaseCard
const Level1Component${index + 1} = ${styled}(BaseCard)\`
  border-left: 4px solid ${baseColor};
  background-color: ${baseColor}11;
\`;

// Level 2 - extends Level1
const Level2Component${index + 1} = ${styled}(Level1Component${index + 1})\`
  border-top: 2px solid ${baseColor};
  padding-top: 20px;
\`;

// Level 3 - extends Level2
const Level3Component${index + 1} = ${styled}(Level2Component${index + 1})\`
  border-right: 2px solid ${baseColor};
  padding-right: 20px;
\`;

// Level 4 - extends Level3
const Level4Component${index + 1} = ${styled}(Level3Component${index + 1})\`
  border-bottom: 2px solid ${baseColor};
  padding-bottom: 20px;
\`;

// Level 5 - extends Level4 (final)
const NestedComponent${index + 1} = ${styled}(Level4Component${index + 1})\`
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, ${baseColor}22, transparent);
    pointer-events: none;
    border-radius: 8px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
\`;`;
}).join("")}

export const NestedComponents${lib === "next-yak" ? "Yak" : "Styled"}: FunctionComponent = () => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto' }}>
      ${Array.from(
        { length: componentCount },
        (_, index) =>
          `<NestedComponent${index + 1}>
        <h3>Nested ${index + 1}</h3>
        <p>This component extends through 5 levels of inheritance</p>
        <small>Level 1 → Level 2 → Level 3 → Level 4 → Level 5</small>
      </NestedComponent${index + 1}>`,
      ).join("\n      ")}
    </div>
  );
};
`;

  writeBenchmarkSource("NestedComponents", lib, fileContent);
}
