import * as swc from "@swc/core";
import { writeFile } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Function to generate 1000 dynamic prop components
async function generateDynamicPropsComponentsFile() {
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
      lib === "next-yak" ? `{ styled as ${styled}, css }` : `{ ${styled}, css }`
    } from '${lib}';

interface DynamicProps {
  $primary?: boolean;
  $size?: 'small' | 'medium' | 'large';
  $variant?: 'solid' | 'outline' | 'ghost';
  $disabled?: boolean;
}

${Array.from({ length: componentCount }, (_, index) => {
  const baseColor = `#${(index + 1).toString(16).padStart(6, "0")}`;
  return `const DynamicComponent${index + 1} = ${styled}.div<DynamicProps>\`
  color: \${props => props.$primary ? '${baseColor}' : '#666'};
  background-color: \${props => {
    if (props.$disabled) return '#f5f5f5';
    if (props.$variant === 'solid') return '${baseColor}22';
    if (props.$variant === 'outline') return 'transparent';
    return '${baseColor}11';
  }};
  border: 2px solid \${props => {
    if (props.$disabled) return '#ddd';
    if (props.$variant === 'outline') return '${baseColor}';
    return 'transparent';
  }};
  padding: \${props => {
    switch (props.$size) {
      case 'small': return '4px 8px';
      case 'large': return '12px 24px';
      default: return '8px 16px';
    }
  }};
  font-size: \${props => {
    switch (props.$size) {
      case 'small': return '12px';
      case 'large': return '18px';
      default: return '14px';
    }
  }};
  border-radius: 6px;
  margin: 2px;
  display: inline-block;
  cursor: \${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: \${props => props.$disabled ? 0.5 : 1};
  transition: all 0.2s ease;
  
  &:hover {
    transform: \${props => props.$disabled ? 'none' : 'translateY(-1px)'};
    box-shadow: \${props => props.$disabled ? 'none' : \`0 2px 4px ${baseColor}44\`};
  }
  
  &:active {
    transform: \${props => props.$disabled ? 'none' : 'translateY(0)'};
  }
\`;`;
}).join("\n\n")}

export const DynamicPropsComponents${
      lib === "next-yak" ? "Yak" : "Styled"
    }: FunctionComponent = () => {
  const [state, setState] = React.useState(0);
  
  return (
    <div>
      <button onClick={() => setState(s => s + 1)}>
        Toggle State ({state})
      </button>
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
        Dynamic {${index + 1}} {state % 2 === 0 ? 'A' : 'B'}
      </DynamicComponent${index + 1}>`;
      }).join("\n      ")}
    </div>
  );
};
`;

    mkdirSync(`${__dirname}/../generated`, { recursive: true });
    writeFile(
      `${__dirname}/../generated/DynamicPropsComponents.${lib}.tsx`,
      fileContent,
      (err) => {
        if (err) throw err;
        console.log(
          `DynamicPropsComponents.${lib}.tsx has been created successfully.`,
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
        `${__dirname}/../generated/DynamicPropsComponents.${lib}.compiled.tsx`,
        compiled,
        (err) => {
          if (err) throw err;
          console.log(
            `DynamicPropsComponents.${lib}.compiled.tsx has been created successfully.`,
          );
        },
      );
    }
  }
}

generateDynamicPropsComponentsFile();
