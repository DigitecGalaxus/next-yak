import swc from "@swc/core";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const { transformSync } = swc;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = dirname(scriptDir);
const fixtureRoot = join(packageRoot, "yak_swc/tests/fixture");
const wasmPath = join(packageRoot, "target/wasm32-wasip1/release/yak_swc.wasm");

const EXACT_MATCH_EXCEPTIONS = new Set([
  "css-prop",
  "css-prop-conditional",
  "css-prop-invalid",
  "css-prop-with-atoms",
  "member-property-runtime-values",
  "theming-with-context",
  "typecast-in-static-analysis",
  "typecast-styled-component",
]);

const MODES = [
  [
    "dev",
    "output.dev.tsx",
    "output.dev.stderr",
    {
      minify: false,
      displayNames: true,
      importMode: {
        value:
          "./{{__BASE_NAME__}}.yak.module.css!=!./{{__BASE_NAME__}}?./{{__BASE_NAME__}}.yak.module.css",
        transpilation: "CssModule",
        encoding: "None",
      },
    },
  ],
  [
    "prod",
    "output.prod.tsx",
    "output.prod.stderr",
    {
      minify: true,
      displayNames: false,
      importMode: {
        value:
          "./{{__BASE_NAME__}}.yak.module.css!=!./{{__BASE_NAME__}}?./{{__BASE_NAME__}}.yak.module.css",
        transpilation: "CssModule",
        encoding: "None",
      },
    },
  ],
  [
    "turbo.dev",
    "output.turbo.dev.tsx",
    "output.turbo.dev.stderr",
    {
      minify: false,
      displayNames: true,
      importMode: {
        value: "data:text/css;base64,",
        transpilation: "Css",
        encoding: "Base64",
      },
    },
  ],
  [
    "turbo.prod",
    "output.turbo.prod.tsx",
    "output.turbo.prod.stderr",
    {
      minify: true,
      displayNames: false,
      importMode: {
        value: "data:text/css;base64,",
        transpilation: "Css",
        encoding: "Base64",
      },
    },
  ],
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
};

if (!existsSync(wasmPath)) {
  console.error(
    `Missing wasm plugin at ${relative(process.cwd(), wasmPath)}.\n` +
      "Build it first with: pnpm --filter yak-swc build:yak",
  );
  process.exit(1);
}

const failures = [];
const stats = {
  exact: 0,
  exactSkipped: 0,
  expectedErrors: 0,
  missingExpectedOutput: 0,
  checked: 0,
};

for (const fixtureName of readdirSync(fixtureRoot).sort()) {
  const fixtureDir = join(fixtureRoot, fixtureName);
  if (!statSync(fixtureDir).isDirectory()) continue;

  const inputPath = join(fixtureDir, "input.tsx");
  if (!existsSync(inputPath)) continue;

  const input = readFileSync(inputPath, "utf8");

  for (const [modeName, outputName, stderrName, pluginOptions] of MODES) {
    const outputPath = join(fixtureDir, outputName);
    const stderrPath = join(fixtureDir, stderrName);
    const label = `${fixtureName}/${modeName}`;

    if (!existsSync(outputPath)) {
      stats.missingExpectedOutput++;
      failures.push(`${label}: missing expected output ${outputName}`);
      continue;
    }

    let actual;
    try {
      actual = runWasmTransform(input, pluginOptions);
    } catch (error) {
      if (existsSync(stderrPath)) {
        stats.expectedErrors++;
        continue;
      }

      failures.push(`${label}: wasm transform threw unexpectedly\n${firstLine(error)}`);
      continue;
    }

    stats.checked++;
    failures.push(...checkPureInvariants(label, actual));

    if (EXACT_MATCH_EXCEPTIONS.has(fixtureName)) {
      stats.exactSkipped++;
      continue;
    }

    const expected = readFileSync(outputPath, "utf8");
    if (actual === expected) {
      stats.exact++;
      continue;
    }

    failures.push(`${label}: output differs\n${formatFirstDiff(expected, actual)}`);
  }
}

console.log(
  [
    `wasm fixture checks: ${stats.checked} outputs`,
    `${stats.exact} exact matches`,
    `${stats.exactSkipped} exact comparisons skipped`,
    `${stats.expectedErrors} expected errors`,
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

function runWasmTransform(input, pluginOptions) {
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
              ...pluginOptions,
            },
          ],
        ],
      },
    },
  }).code;
}

function checkPureInvariants(label, code) {
  const invariantFailures = [];

  if (/\/\*#__PURE__\*\/\s*$/.test(code)) {
    invariantFailures.push(`${label}: orphan PURE annotation at end of output`);
  }

  if (/export\s*\{[^}]*\};\s*\/\*#__PURE__\*\//.test(code)) {
    invariantFailures.push(`${label}: orphan PURE annotation after export block`);
  }

  let index = 0;
  while ((index = code.indexOf("css(", index)) !== -1) {
    const prefix = code.slice(Math.max(0, index - 80), index);
    if (!prefix.includes("/*#__PURE__*/")) {
      invariantFailures.push(
        `${label}: css() call without nearby PURE annotation near ${formatSnippet(code, index)}`,
      );
    }
    index += "css(".length;
  }

  return invariantFailures;
}

function firstLine(error) {
  return String(error?.stack || error?.message || error).split("\n")[0];
}

function formatFirstDiff(expected, actual) {
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

function formatSnippet(code, index) {
  return JSON.stringify(code.slice(Math.max(0, index - 80), index + 120));
}
