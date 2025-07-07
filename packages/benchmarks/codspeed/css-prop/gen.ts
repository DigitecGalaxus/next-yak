import * as swc from "@swc/core";
import { writeFile } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Function to generate 1000 css prop components
async function generateCssPropComponentsFile() {
  const componentCount = 1000;
  
  const libs = {
    "next-yak": "next-yak",
    "styled-components": "styled-components",
  };

  for (const lib in libs) {
    const fileContent = `
"use client";
import React, { type FunctionComponent } from 'react';
import { css } from '${lib}';

export const CssPropComponents${
      lib === "next-yak" ? "Yak" : "Styled"
    }: FunctionComponent = () => {
  return (
    <div>
      ${Array.from({ length: componentCount }, (_, index) => 
        {
          const colorValue = `#${((index * 123456) % 16777215).toString(16).padStart(6, '0')}`;
          return `<div css={ css\`
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
\`}>CSS ${index + 1}</div>`;
        }
      ).join('\n      ')}
    </div>
  );
};
`;

    mkdirSync(`${__dirname}/../generated`, { recursive: true });
    writeFile(
      `${__dirname}/../generated/CssPropComponents.${lib}.tsx`,
      fileContent,
      (err) => {
        if (err) throw err;
        console.log(
          `CssPropComponents.${lib}.tsx has been created successfully.`,
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
        `${__dirname}/../generated/CssPropComponents.${lib}.compiled.tsx`,
        compiled,
        (err) => {
          if (err) throw err;
          console.log(
            `CssPropComponents.${lib}.compiled.tsx has been created successfully.`,
          );
        },
      );
    }
  }
}

generateCssPropComponentsFile();