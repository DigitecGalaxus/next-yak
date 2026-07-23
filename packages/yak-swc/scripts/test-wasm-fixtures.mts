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

// Mirrors the Rust fixture harness (`FixtureOptions` in lib.rs): folding is off
// by default here so the bulk of the suite covers the runtime transform; a
// fixture opts into folding with `{"foldStatic": true}`. This is independent of
// the shipped `Config` default (on).
type FixtureOptions = {
  foldStatic: boolean;
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
  const { foldStatic } = readFixtureOptions(fixtureDir);

  for (const { name: modeName, output, stderr, options } of MODES) {
    const outputPath = join(fixtureDir, output);
    const stderrPath = join(fixtureDir, stderr);
    const label = `${fixtureName}/${modeName}`;

    // Diagnostic fixtures: the plugin emits an error. Natively that is collected
    // as a recoverable diagnostic while the transform still produces a "recovered"
    // output, so the recovered output isn't reproducible here. Through @swc/core an
    // emitted plugin error aborts the transform, so we assert the wasm plugin
    // surfaces the diagnostic as a throw. This guards the wasm ABI: a regression
    // that silently drops an error across the boundary (leaving the offending code
    // untransformed instead of failing) can't be caught by `cargo test`, which only
    // exercises the native path.
    if (existsSync(stderrPath)) {
      stats.diagnostics++;
      try {
        runWasmTransform(input, options, foldStatic);
        failures.push(
          `${label}: native records a diagnostic (${stderr}) but the wasm transform ` +
            `succeeded without throwing — the error was dropped across the wasm ABI`,
        );
      } catch {
        // expected: the host surfaces the diagnostic as a throw
      }
      continue;
    }

    if (!existsSync(outputPath)) {
      failures.push(`${label}: missing expected output ${output}`);
      continue;
    }

    let actual: string;
    try {
      actual = runWasmTransform(input, options, foldStatic);
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

function runWasmTransform(input: string, options: PluginOptions, foldStatic: boolean): string {
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
              foldStatic,
              ...options,
            },
          ],
        ],
      },
    },
  }).code;
}

// Reads the optional per-fixture `config.json`, mirroring the Rust harness:
// folding defaults to off, `{"foldStatic": true}` opts in. Malformed JSON,
// a non-object, a non-boolean value or any unknown key fails loudly - the same
// spirit as the Rust `deny_unknown_fields` plus parse panic, never a silent
// default.
function readFixtureOptions(fixtureDir: string): FixtureOptions {
  const configPath = join(fixtureDir, "config.json");
  if (!existsSync(configPath)) {
    return { foldStatic: false };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(configPath, "utf8"));
  } catch (error) {
    throw new Error(`invalid fixture config.json: ${configPath}: ${firstLine(error)}`);
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`invalid fixture config.json: ${configPath}: expected a JSON object`);
  }
  const options: FixtureOptions = { foldStatic: false };
  for (const [key, value] of Object.entries(parsed)) {
    if (key !== "foldStatic") {
      throw new Error(`invalid fixture config.json: ${configPath}: unknown key "${key}"`);
    }
    if (typeof value !== "boolean") {
      throw new Error(`invalid fixture config.json: ${configPath}: foldStatic must be a boolean`);
    }
    options.foldStatic = value;
  }
  return options;
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
