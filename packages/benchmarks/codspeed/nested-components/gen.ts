import * as swc from "@swc/core";
import { writeFile } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Function to generate nested styled components
async function generateNestedComponentsFile() {
  const componentCount = 200; // Reduced since we have 5 levels of nesting

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

export const NestedComponents${
      lib === "next-yak" ? "Yak" : "Styled"
    }: FunctionComponent = () => {
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

    mkdirSync(`${__dirname}/../generated`, { recursive: true });
    writeFile(
      `${__dirname}/../generated/NestedComponents.${lib}.tsx`,
      fileContent,
      (err) => {
        if (err) throw err;
        console.log(
          `NestedComponents.${lib}.tsx has been created successfully.`,
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
        `${__dirname}/../generated/NestedComponents.${lib}.compiled.tsx`,
        compiled,
        (err) => {
          if (err) throw err;
          console.log(
            `NestedComponents.${lib}.compiled.tsx has been created successfully.`,
          );
        },
      );
    }
  }
}

generateNestedComponentsFile();
