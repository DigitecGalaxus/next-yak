import * as swc from "@swc/core";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

// Shared helpers for the per-benchmark `gen.ts` files. Each `gen.ts` builds
// a TSX source string for both libraries and hands it to writeBenchmarkSource;
// this module owns the actual file writes plus the SWC pre-compile step
// that mirrors what the next-yak loader does at app build time (the bench
// harness imports the .compiled.tsx files directly because tsdown doesn't
// run our loader).

const require = createRequire(import.meta.url);

const generatedDir = join(dirname(fileURLToPath(import.meta.url)), "generated");
mkdirSync(generatedDir, { recursive: true });

export type Lib = "next-yak" | "styled-components" | "vanilla";

export const libs = ["next-yak", "styled-components"] as const;

/**
 * Lane set including the hand-written "speed of light" baseline: plain JSX
 * with literal class names and inline-style CSS variables — the output a
 * perfect compiler would produce, with zero library runtime. Benchmarks
 * that have a vanilla variant generate it as a separate source block (the
 * styled template helpers below don't apply to it).
 */
export const libs3 = ["next-yak", "styled-components", "vanilla"] as const;

/** Component export suffix per lane (PureComponentsYak / ...Styled / ...Vanilla). */
export const suffixFor = (lib: Lib) =>
  lib === "next-yak" ? "Yak" : lib === "styled-components" ? "Styled" : "Vanilla";

/** Identifier used as the `styled` import alias inside generated source. */
export const styledIdentFor = (lib: Lib) => (lib === "next-yak" ? "styledYak" : "styled");

/**
 * Standard idiomatic-conditional helper used across benchmarks:
 *   - next-yak: `${(p) => predicate && css`...`}` (toggleable class).
 *   - styled-components: `${(p) => predicate && '...'}` (raw CSS string).
 *
 * Both forms produce equivalent rendered output; each is the native
 * pattern that the respective library's build tooling optimizes for.
 */
export const conditionalDecl = (lib: Lib) => (predicate: string, decls: string) =>
  lib === "next-yak"
    ? `\${(p) => ${predicate} && css\`${decls}\`}`
    : `\${(p) => ${predicate} && '${decls.replace(/\n\s*/g, " ")}'}`;

/**
 * Multi-branch sibling of `conditionalDecl`: collapses N mutually-exclusive
 * predicates over the same prop into ONE dynamic interpolation - one
 * function call evaluating a single ternary chain, instead of N independent
 * function calls each running their own predicate. Branches fall through
 * top-to-bottom; if none matches the function returns false (no class).
 *
 * Example: `branch(lib)([{ when: \`p.$x === 'a'\`, decls: 'color: red;' },
 *                        { when: \`p.$x === 'b'\`, decls: 'color: blue;' }])`
 * emits `${(p) => p.$x === 'a' ? css`color: red;` : p.$x === 'b' ? css`color: blue;` : false}`.
 */
export const branch = (lib: Lib) => (branches: ReadonlyArray<{ when: string; decls: string }>) => {
  const formatValue = (decls: string) =>
    lib === "next-yak" ? `css\`${decls}\`` : `'${decls.replace(/\n\s*/g, " ")}'`;
  const chain = branches.reduceRight(
    (acc, { when, decls }) => `${when} ? ${formatValue(decls)} : ${acc}`,
    "false",
  );
  return `\${(p) => ${chain}}`;
};

/**
 * Standard import header for a generated TSX file. Optionally pulls in
 * `css` (some benchmarks use it for inline `css={css\`...\`}`, others
 * just need `styled`).
 */
export const importHeader = (lib: Lib, withCss = true) => {
  const styled = styledIdentFor(lib);
  if (lib === "next-yak") {
    return `import ${withCss ? `{ styled as ${styled}, css }` : `{ styled as ${styled} }`} from 'next-yak';`;
  }
  return `import ${withCss ? `{ ${styled}, css }` : `{ ${styled} }`} from 'styled-components';`;
};

/**
 * Vanilla "speed of light" Box+View tree source shared by the Tree-family
 * benchmarks (tree, tree-deep, tree-wide). A perfect compiler collapses
 * `styled(View)` into one component: literal classes ("view box", plus a
 * "boxFixed" toggle) and dynamic values as a plain CSS-variable style
 * object — zero library runtime, same React component count as the
 * yak/styled lanes.
 */
export const vanillaTreeSource = (
  exportName: string,
  breadth: number,
  depth: number,
  wrap: number,
) => `
"use client";
import React, { type FunctionComponent } from 'react';

const getColor = (color: number) => {
  switch (color) {
    case 0: return '#14171A';
    case 1: return '#AAB8C2';
    case 2: return '#E6ECF0';
    case 3: return '#FFAD1F';
    case 4: return '#F45D22';
    case 5: return '#E0245E';
    default: return 'transparent';
  }
};

interface BoxProps {
  $color?: number;
  $layout?: 'column' | 'row';
  $outer?: boolean;
  $fixed?: boolean;
  children?: React.ReactNode;
}

const Box: FunctionComponent<BoxProps> = ({ $color, $layout, $outer, $fixed, children }) => (
  <div
    className={$fixed ? "view box boxFixed" : "view box"}
    style={{
      '--fd': $layout === 'column' ? 'column' : 'row',
      '--p': $outer ? '4px' : '0',
      '--bg': getColor($color ?? -1),
    } as React.CSSProperties}
  >
    {children}
  </div>
);

interface TreeProps {
  breadth: number;
  depth: number;
  id: number;
  wrap: number;
}

const Tree: FunctionComponent<TreeProps> = ({ breadth, depth, id, wrap }) => {
  let result = (
    <Box $color={id % 3} $layout={depth % 2 === 0 ? 'column' : 'row'} $outer>
      {depth === 0 && <Box $color={(id % 3) + 3} $fixed />}
      {depth !== 0 &&
        Array.from({ length: breadth }).map((_, i) => (
          <Tree
            breadth={breadth}
            depth={depth - 1}
            id={i}
            key={i}
            wrap={wrap}
          />
        ))}
    </Box>
  );
  for (let i = 0; i < wrap; i++) {
    result = <Box>{result}</Box>;
  }
  return result;
};

export const ${exportName}: FunctionComponent = () => (
  <Tree breadth={${breadth}} depth={${depth}} id={0} wrap={${wrap}} />
);
`;

/**
 * Run a TSX source through the next-yak SWC plugin, mirroring what the
 * webpack/vite/turbo loader does for app code at build time. Strips the
 * generated `*.yak.module.css` import (the bench harness has no CSS
 * pipeline) and inlines `__styleYak.foo` -> `"foo"` so class refs are
 * literal strings the runtime will pass straight through.
 */
function compileYak(source: string): string {
  return (
    "// @ts-nocheck\n" +
    swc
      .transformSync(source, {
        filename: "/foo/index.tsx",
        jsc: {
          experimental: {
            plugins: [[require.resolve("yak-swc"), { basePath: "/foo/" }]],
          },
          target: "es2022",
          loose: false,
          minify: { compress: false, mangle: false },
          preserveAllComments: true,
        },
        minify: false,
        isModule: true,
      })
      .code.replace(/import[^;\n]+yak.module.css";/, "")
      .replace(/__styleYak.(\w+)/g, `"$1"`)
  );
}

/**
 * Write the generated TSX source for a benchmark. For `next-yak` also emit
 * the precompiled `.compiled.tsx` variant that the bench harness imports
 * directly.
 */
export function writeBenchmarkSource(benchmarkName: string, lib: Lib, source: string): void {
  const sourcePath = join(generatedDir, `${benchmarkName}.${lib}.tsx`);
  writeFileSync(sourcePath, source);
  console.log(`${benchmarkName}.${lib}.tsx`);

  if (lib === "next-yak") {
    const compiledPath = join(generatedDir, `${benchmarkName}.${lib}.compiled.tsx`);
    writeFileSync(compiledPath, compileYak(source));
    console.log(`${benchmarkName}.${lib}.compiled.tsx`);
  }
}
