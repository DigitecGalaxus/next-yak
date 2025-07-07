import * as swc from "@swc/core";
import { writeFile } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Function to generate 1000 .attrs styled components
async function generateAttrsComponentsFile() {
  const componentCount = 1000;
  
  const libs = {
    "next-yak": "styledYak",
    "styled-components": "styled",
  };

  for (const lib in libs) {
    const styled = libs[lib];

    const fileContent = `
"use client";
import React, { type FunctionComponent } from 'react';
import ${
      lib === "next-yak" ? `{ styled as ${styled} }` : `{ ${styled} }`
    } from '${lib}';

${Array.from({ length: componentCount }, (_, index) => {
  const colorValue = `#${(index + 1).toString(16).padStart(6, '0')}`;
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
}).join('\n\n')}

export const AttrsComponents${
      lib === "next-yak" ? "Yak" : "Styled"
    }: FunctionComponent = () => {
  return (
    <div>
      ${Array.from({ length: componentCount }, (_, index) => 
        `<AttrsComponent${index + 1}>Attrs ${index + 1}</AttrsComponent${index + 1}>`
      ).join('\n      ')}
    </div>
  );
};
`;

    mkdirSync(`${__dirname}/../generated`, { recursive: true });
    writeFile(
      `${__dirname}/../generated/AttrsComponents.${lib}.tsx`,
      fileContent,
      (err) => {
        if (err) throw err;
        console.log(
          `AttrsComponents.${lib}.tsx has been created successfully.`,
        );
      },
    );

    // Precompile yak similar to how it would be compiled by our loader
    if (lib === "next-yak") {
      const compiled =
        "// @ts-nocheck\n" +
        swc
          .transformSync(fileContent, {
            filename: "/foo/index.tsx",
            jsc: {
              experimental: {
                plugins: [[require.resolve("yak-swc"), { basePath: "/foo/" }]],
              },
              target: "es2022",
              loose: false,
              minify: {
                compress: false,
                mangle: false,
              },
              preserveAllComments: true,
            },
            minify: false,
            isModule: true,
          })
          .code // Remove __styleYak import
          .replace(/import[^;\n]+yak.module.css";/, "")
          // Replace __styleYak usage to a string
          .replace(/__styleYak.(\w+)/g, `"$1"`);
      mkdirSync(`${__dirname}/../generated`, { recursive: true });
      writeFile(
        `${__dirname}/../generated/AttrsComponents.${lib}.compiled.tsx`,
        compiled,
        (err) => {
          if (err) throw err;
          console.log(
            `AttrsComponents.${lib}.compiled.tsx has been created successfully.`,
          );
        },
      );
    }
  }
}

generateAttrsComponentsFile();