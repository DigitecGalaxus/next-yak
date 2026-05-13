import { libs, writeBenchmarkSource } from "../_shared.ts";

// 1000 elements with a one-off style per element, written in each library's
// idiomatic build-extracted form. Yak uses `<div css={css`...`}>`.
// styled-components uses one `styled.div` per instance (the shape that
// babel-plugin-styled-components produces from its `css` prop). We emit the
// styled.div form directly because our build pipeline runs SWC, not the
// styled-components Babel plugin.
const componentCount = 1000;

for (const lib of libs) {
  const isYak = lib === "next-yak";

  const colorFor = (index: number) =>
    `#${((index * 123456) % 16777215).toString(16).padStart(6, "0")}`;

  const cssBlock = (index: number) => {
    const colorValue = colorFor(index);
    return `
  color: ${colorValue};
  background-color: ${colorValue}33;
  padding: 8px 16px;
  margin: 4px;
  border-radius: 8px;
  font-size: 16px;
  display: inline-block;
  border: 2px solid ${colorValue};
  box-shadow: 0 2px 4px ${colorValue}44;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px ${colorValue}66;
  }

  &:active {
    transform: translateY(0);
  }
`;
  };

  const fileContent = isYak
    ? `
"use client";
import React, { type FunctionComponent } from 'react';
import { css } from 'next-yak';

export const CssPropComponentsYak: FunctionComponent = () => {
  return (
    <div>
      ${Array.from(
        { length: componentCount },
        (_, index) => `<div css={ css\`${cssBlock(index)}\`}>CSS ${index + 1}</div>`,
      ).join("\n      ")}
    </div>
  );
};
`
    : `
"use client";
import React, { type FunctionComponent } from 'react';
import { styled } from 'styled-components';

${Array.from(
  { length: componentCount },
  (_, index) => `const CssPropDiv${index + 1} = styled.div\`${cssBlock(index)}\`;`,
).join("\n")}

export const CssPropComponentsStyled: FunctionComponent = () => {
  return (
    <div>
      ${Array.from(
        { length: componentCount },
        (_, index) => `<CssPropDiv${index + 1}>CSS ${index + 1}</CssPropDiv${index + 1}>`,
      ).join("\n      ")}
    </div>
  );
};
`;

  writeBenchmarkSource("CssPropComponents", lib, fileContent);
}
