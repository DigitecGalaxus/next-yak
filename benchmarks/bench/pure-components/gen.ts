import { importHeader, libs, styledIdentFor, writeBenchmarkSource } from "../_shared.ts";


// 1000 plain styled.div components, each with a unique color and identical
// shape. Cheapest "many components" baseline (no dynamic props, no extension
// chain, just static-style class generation).
const componentCount = 1000;

for (const lib of libs) {
  const styled = styledIdentFor(lib);

  const source = `
"use client";
import React, { type FunctionComponent } from 'react';
${importHeader(lib, /* withCss */ false)}

${Array.from({ length: componentCount }, (_, index) => {
  const colorValue = `#${(index + 1).toString(16).padStart(6, "0")}`;
  return `const Component${index + 1} = ${styled}.div\`
  color: ${colorValue};
  background-color: ${colorValue}11;
  padding: 4px;
  margin: 2px;
  border-radius: 4px;
  font-size: 12px;
  display: inline-block;
\`;`;
}).join("\n\n")}

export const PureComponents${lib === "next-yak" ? "Yak" : "Styled"}: FunctionComponent = () => {
  return (
    <div>
      ${Array.from(
        { length: componentCount },
        (_, index) => `<Component${index + 1}>Item ${index + 1}</Component${index + 1}>`,
      ).join("\n      ")}
    </div>
  );
};
`;

  writeBenchmarkSource("PureComponents", lib, source);
}

// Vanilla "speed of light" lane: what a perfect compiler would emit — one
// function component per item with a literal className, zero library runtime.
// (Class definitions would live in an extracted .css file; the SSR bench has
// no CSS pipeline, mirroring how the yak lane inlines class refs.)
const vanillaSource = `
"use client";
import React, { type FunctionComponent } from 'react';

${Array.from(
  { length: componentCount },
  (_, index) =>
    `const Component${index + 1}: FunctionComponent<{ children?: React.ReactNode }> = ({ children }) => <div className="comp_${index + 1}">{children}</div>;`,
).join("\n")}

export const PureComponentsVanilla: FunctionComponent = () => {
  return (
    <div>
      ${Array.from(
        { length: componentCount },
        (_, index) => `<Component${index + 1}>Item ${index + 1}</Component${index + 1}>`,
      ).join("\n      ")}
    </div>
  );
};
`;

writeBenchmarkSource("PureComponents", "vanilla", vanillaSource);
