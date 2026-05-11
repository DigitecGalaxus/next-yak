import { importHeader, libs, styledIdentFor, writeBenchmarkSource } from "../_shared.ts";

// 1000 styled.div components declared with `.attrs({...})` to attach default
// props (className, data-testid, role, tabIndex, etc.) at component creation
// time. Tests the per-render cost of the attrs pipeline.
const componentCount = 1000;

for (const lib of libs) {
  const styled = styledIdentFor(lib);

  const fileContent = `
"use client";
import React, { type FunctionComponent } from 'react';
${importHeader(lib, /* withCss */ false)}

${Array.from({ length: componentCount }, (_, index) => {
  const colorValue = `#${(index + 1).toString(16).padStart(6, "0")}`;
  const className = `attrs-component-${index + 1}`;
  return `const AttrsComponent${index + 1} = ${styled}.div.attrs({
  className: '${className}',
  'data-testid': 'attrs-${index + 1}',
  role: 'button',
  tabIndex: 0,
})\`
  color: ${colorValue};
  background-color: ${colorValue}22;
  padding: 6px 12px;
  margin: 3px;
  border-radius: 6px;
  font-size: 14px;
  display: inline-block;
  cursor: pointer;
  border: 1px solid ${colorValue};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${colorValue}44;
  }

  &:focus {
    outline: 2px solid ${colorValue};
    outline-offset: 2px;
  }
\`;`;
}).join("\n\n")}

export const AttrsComponents${lib === "next-yak" ? "Yak" : "Styled"}: FunctionComponent = () => {
  return (
    <div>
      ${Array.from(
        { length: componentCount },
        (_, index) => `<AttrsComponent${index + 1}>Attrs ${index + 1}</AttrsComponent${index + 1}>`,
      ).join("\n      ")}
    </div>
  );
};
`;

  writeBenchmarkSource("AttrsComponents", lib, fileContent);
}
