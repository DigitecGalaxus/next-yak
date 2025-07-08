import * as swc from "@swc/core";
import { writeFile } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Function to generate 1000 pure styled components
async function generatePureComponentsFile() {
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

export const PureComponents${
      lib === "next-yak" ? "Yak" : "Styled"
    }: FunctionComponent = () => {
  return (
    <div>
      ${Array.from(
        { length: componentCount },
        (_, index) =>
          `<Component${index + 1}>Item ${index + 1}</Component${index + 1}>`,
      ).join("\n      ")}
    </div>
  );
};
`;

    mkdirSync(`${__dirname}/../generated`, { recursive: true });
    writeFile(
      `${__dirname}/../generated/PureComponents.${lib}.tsx`,
      fileContent,
      (err) => {
        if (err) throw err;
        console.log(`PureComponents.${lib}.tsx has been created successfully.`);
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
        `${__dirname}/../generated/PureComponents.${lib}.compiled.tsx`,
        compiled,
        (err) => {
          if (err) throw err;
          console.log(
            `PureComponents.${lib}.compiled.tsx has been created successfully.`,
          );
        },
      );
    }
  }
}

generatePureComponentsFile();
