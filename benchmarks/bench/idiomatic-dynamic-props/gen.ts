import {
  branch,
  conditionalDecl,
  importHeader,
  libs,
  styledIdentFor,
  writeBenchmarkSource,
} from "../_shared.ts";

// This is the class-toggle counterpart to DynamicPropsComponents.
// Same shape (1000 components, $primary / $size / $variant / $disabled props),
// but every dynamic value is rewritten as a class toggle (`${p => cond && css`...`}`)
// instead of a CSS-variable interpolation.
const componentCount = 1000;

for (const lib of libs) {
  const styled = styledIdentFor(lib);
  const isYak = lib === "next-yak";

  const cond = conditionalDecl(lib);
  const switchProp = branch(lib);

  const fileContent = `
"use client";
import React, { type FunctionComponent } from 'react';
${importHeader(lib)}

interface DynamicProps {
  $primary?: boolean;
  $size?: 'small' | 'medium' | 'large';
  $variant?: 'solid' | 'outline' | 'ghost';
  $disabled?: boolean;
}

${Array.from({ length: componentCount }, (_, index) => {
  const baseColor = `#${(index + 1).toString(16).padStart(6, "0")}`;
  const toggles = [
    cond(`p.$primary`, `color: ${baseColor};`),
    switchProp([
      {
        when: `p.$variant === 'outline'`,
        decls: `background-color: transparent; border-color: ${baseColor};`,
      },
      { when: `p.$variant === 'solid'`, decls: `background-color: ${baseColor}22;` },
    ]),
    switchProp([
      { when: `p.$size === 'small'`, decls: `padding: 4px 8px; font-size: 12px;` },
      { when: `p.$size === 'large'`, decls: `padding: 12px 24px; font-size: 18px;` },
    ]),
    cond(
      `p.$disabled`,
      `background-color: #f5f5f5; border-color: #ddd; cursor: not-allowed; opacity: 0.5; &:hover { transform: none; box-shadow: none; } &:active { transform: none; }`,
    ),
  ];
  return `const DynamicComponent${index + 1} = ${styled}.div<DynamicProps>\`
  color: #666;
  background-color: ${baseColor}11;
  border: 2px solid transparent;
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 6px;
  margin: 2px;
  display: inline-block;
  cursor: pointer;
  opacity: 1;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px ${baseColor}44;
  }

  &:active {
    transform: translateY(0);
  }
  ${toggles.join("\n  ")}
\`;`;
}).join("\n\n")}

export const IdiomaticDynamicPropsComponents${isYak ? "Yak" : "Styled"}: FunctionComponent = () => {
  return (
    <div>
      ${Array.from({ length: componentCount }, (_, index) => {
        const variants = ["solid", "outline", "ghost"];
        const sizes = ["small", "medium", "large"];
        const variant = variants[index % variants.length];
        const size = sizes[index % sizes.length];
        const isPrimary = index % 2 === 0;
        const isDisabled = index % 10 === 0;
        return `<DynamicComponent${index + 1}
        $primary={${isPrimary}}
        $size="${size}"
        $variant="${variant}"
        $disabled={${isDisabled}}
      >
        Dynamic {${index + 1}}
      </DynamicComponent${index + 1}>`;
      }).join("\n      ")}
    </div>
  );
};
`;

  writeBenchmarkSource("IdiomaticDynamicProps", lib, fileContent);
}
