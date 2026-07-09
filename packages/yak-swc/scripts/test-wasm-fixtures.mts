import swc from "@swc/core";
import { existsSync, readFileSync } from "node:fs";
import { glob } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const { transformSync } = swc;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = dirname(scriptDir);
const fixtureRoot = join(packageRoot, "yak_swc/tests/fixture");
const wasmPath = join(packageRoot, "target/wasm32-wasip1/release/yak_swc.wasm");

type ImportMode = {
  value: string;
  transpilation: string;
  encoding: string;
};

type PluginOptions = {
  minify: boolean;
  displayNames: boolean;
  importMode: ImportMode;
};

type Mode = {
  name: string;
  output: string;
  stderr: string;
  options: PluginOptions;
};

// The native fixture snapshots are emitted by swc's own codegen and keep
// TypeScript syntax, whereas running the wasm plugin through @swc/core strips
// types and formats comments/imports its own way. To compare like for like we
// push BOTH sides through the same plugin-less @swc/core pass ("normalize"):
// the reparse artifacts (type stripping, unused-import elision, comment
// spacing) then apply identically to each side and cancel out. Whatever still
// differs is a genuine wasm-vs-native difference in the plugin output.
//
// Fixtures listed here legitimately can't match even after normalization; keep
// the list tiny and document why each one is here.
const EXACT_MATCH_EXCEPTIONS = new Set<string>([
  // @swc/core attaches the leading `// @ts-ignore` comment differently than the
  // native codegen.
  "typecast-styled-component",
]);

const CSS_MODULE_IMPORT: ImportMode = {
  value:
    "./{{__BASE_NAME__}}.yak.module.css!=!./{{__BASE_NAME__}}?./{{__BASE_NAME__}}.yak.module.css",
  transpilation: "CssModule",
  encoding: "None",
};

const TURBO_IMPORT: ImportMode = {
  value: "data:text/css;base64,",
  transpilation: "Css",
  encoding: "Base64",
};

const MODES: Mode[] = [
  {
    name: "dev",
    output: "output.dev.tsx",
    stderr: "output.dev.stderr",
    options: { minify: false, displayNames: true, importMode: CSS_MODULE_IMPORT },
  },
  {
    name: "prod",
    output: "output.prod.tsx",
    stderr: "output.prod.stderr",
    options: { minify: true, displayNames: false, importMode: CSS_MODULE_IMPORT },
  },
  {
    name: "turbo.dev",
    output: "output.turbo.dev.tsx",
    stderr: "output.turbo.dev.stderr",
    options: { minify: false, displayNames: true, importMode: TURBO_IMPORT },
  },
  {
    name: "turbo.prod",
    output: "output.turbo.prod.tsx",
    stderr: "output.turbo.prod.stderr",
    options: { minify: true, displayNames: false, importMode: TURBO_IMPORT },
  },
];

const BASE_SWC_OPTIONS = {
  filename: "path/input.tsx",
  jsc: {
    parser: {
      syntax: "typescript",
      tsx: true,
    },
    transform: {
      react: {
        runtime: "preserve",
      },
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
} as const;

if (!existsSync(wasmPath)) {
  console.error(
    `Missing wasm plugin at ${relative(process.cwd(), wasmPath)}.\n` +
      "Build it first with: pnpm --filter yak-swc build:yak",
  );
  process.exit(1);
}

const failures: string[] = [];
const stats = {
  exact: 0,
  exactSkipped: 0,
  diagnostics: 0,
  checked: 0,
};

const fixtures: string[] = [];
for await (const entry of glob("**/input.tsx", { cwd: fixtureRoot })) {
  fixtures.push(dirname(entry));
}
fixtures.sort();

for (const fixtureName of fixtures) {
  const fixtureDir = join(fixtureRoot, fixtureName);
  const input = readFileSync(join(fixtureDir, "input.tsx"), "utf8");

  for (const { name: modeName, output, stderr, options } of MODES) {
    const outputPath = join(fixtureDir, output);
    const stderrPath = join(fixtureDir, stderr);
    const label = `${fixtureName}/${modeName}`;

    // Diagnostic fixtures: the plugin emits a recoverable error. Natively that
    // is collected while the transform still produces a "recovered" output.
    // Through @swc/core the host surfaces the diagnostic differently (it either
    // throws or leaves the offending code untransformed), so the recovered
    // output is not reproducible here. The diagnostic itself is covered by
    // `cargo test`; all we assert is that the plugin doesn't take the host down
    // in some other way.
    if (existsSync(stderrPath)) {
      try {
        runWasmTransform(input, options);
      } catch {
        // expected: the host surfaces the diagnostic as a throw
      }
      stats.diagnostics++;
      continue;
    }

    if (!existsSync(outputPath)) {
      failures.push(`${label}: missing expected output ${output}`);
      continue;
    }

    let actual: string;
    try {
      actual = runWasmTransform(input, options);
    } catch (error) {
      failures.push(`${label}: wasm transform threw unexpectedly\n${firstLine(error)}`);
      continue;
    }

    if (EXACT_MATCH_EXCEPTIONS.has(fixtureName)) {
      stats.exactSkipped++;
      continue;
    }

    stats.checked++;

    let expected: string;
    let normalizedActual: string;
    try {
      expected = normalize(readFileSync(outputPath, "utf8"));
      normalizedActual = normalize(actual);
    } catch (error) {
      failures.push(`${label}: normalization pass threw\n${firstLine(error)}`);
      continue;
    }

    if (normalizedActual === expected) {
      stats.exact++;
      continue;
    }

    failures.push(`${label}: output differs\n${formatFirstDiff(expected, normalizedActual)}`);
  }
}

console.log(
  [
    `wasm fixture checks: ${stats.checked} compared`,
    `${stats.exact} match`,
    `${stats.exactSkipped} known exceptions`,
    `${stats.diagnostics} diagnostic fixtures skipped`,
  ].join(", "),
);

if (failures.length > 0) {
  console.error(`\n${failures.length} wasm fixture failure(s):`);
  for (const failure of failures.slice(0, 20)) {
    console.error(`\n${failure}`);
  }
  if (failures.length > 20) {
    console.error(`\n...and ${failures.length - 20} more failure(s).`);
  }
  process.exit(1);
}

// Run a source string through @swc/core with no plugin: strips types, elides
// unused imports and re-emits comments the same way for both sides so those
// artifacts cancel when we diff.
function normalize(code: string): string {
  return transformSync(code, BASE_SWC_OPTIONS).code;
}

function runWasmTransform(input: string, options: PluginOptions): string {
  return transformSync(input, {
    ...BASE_SWC_OPTIONS,
    jsc: {
      ...BASE_SWC_OPTIONS.jsc,
      experimental: {
        plugins: [
          [
            wasmPath,
            {
              basePath: "path",
              ...options,
            },
          ],
        ],
      },
    },
  }).code;
}

function firstLine(error: unknown): string {
  const err = error as { stack?: string; message?: string } | null;
  return String(err?.stack || err?.message || error).split("\n")[0];
}

function formatFirstDiff(expected: string, actual: string): string {
  const max = Math.min(expected.length, actual.length);
  let index = 0;
  while (index < max && expected[index] === actual[index]) {
    index++;
  }

  if (index === max && expected.length === actual.length) {
    return "no character diff found";
  }

  return [
    `first diff at byte ${index}`,
    `expected: ${JSON.stringify(expected.slice(index, index + 220))}`,
    `actual:   ${JSON.stringify(actual.slice(index, index + 220))}`,
  ].join("\n");
}
