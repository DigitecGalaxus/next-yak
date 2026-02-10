/**
 * E2E test orchestrator.
 *
 * For each (bundler x case), assembles a self-contained app in
 * bundlers/<bundler>/.tmp/<case>/ and spawns Playwright against it.
 *
 * Usage: node run.ts [bundler] [case]
 */

import { spawn } from "node:child_process";
import { readdir, rm, mkdir, access, cp } from "node:fs/promises";
import { join, resolve } from "node:path";
import { styleText } from "node:util";

const e2eRoot = import.meta.dirname;

const COLORS = ["cyan", "magenta", "yellow", "blue", "green", "red"] as const;

/** Bundler-dir entries that should never be copied into .tmp */
const EXCLUDED = new Set([
  ".tmp",
  "node_modules",
  "test-results",
  "package.json",
  "playwright.config.ts",
]);

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

const bundlerEntries = await readdir(join(e2eRoot, "bundlers"), {
  withFileTypes: true,
});
const discoveredBundlers: string[] = [];
for (const entry of bundlerEntries) {
  if (!entry.isDirectory()) continue;
  try {
    await access(join(e2eRoot, "bundlers", entry.name, "playwright.config.ts"));
    discoveredBundlers.push(entry.name);
  } catch {
    // No playwright config — not a bundler
  }
}

const caseEntries = await readdir(join(e2eRoot, "cases"), {
  withFileTypes: true,
});
const allCases = caseEntries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const bundlers = process.argv[2] ? [process.argv[2]] : discoveredBundlers;
const cases = process.argv[3] ? [process.argv[3]] : allCases;

interface Result {
  bundler: string;
  caseName: string;
  passed: boolean;
  durationMs: number;
}
function runPlaywright(bundler: string, caseName: string): Promise<boolean> {
  return new Promise((resolve) => {
    const color = COLORS[discoveredBundlers.indexOf(bundler) % COLORS.length];
    const prefix = styleText(color, `[${bundler}/${caseName}]`);
    const child = spawn(
      "pnpm",
      [
        "exec",
        "playwright",
        "test",
        "--config",
        `bundlers/${bundler}/playwright.config.ts`,
      ],
      {
        cwd: e2eRoot,
        env: { ...process.env, BUNDLER: bundler, CASE: caseName },
        stdio: "pipe",
        shell: true,
      },
    );

    child.stdout.on("data", (data: Buffer) => {
      for (const line of data.toString().split("\n")) {
        if (line) process.stdout.write(`${prefix} ${line}\n`);
      }
    });
    child.stderr.on("data", (data: Buffer) => {
      for (const line of data.toString().split("\n")) {
        if (line) process.stderr.write(`${prefix} ${line}\n`);
      }
    });

    child.on("close", (code) => resolve(code === 0));
  });
}

async function runBundlerCases(bundler: string): Promise<Result[]> {
  const results: Result[] = [];
  for (const caseName of cases) {
    const caseDir = resolve(e2eRoot, "bundlers", bundler, ".tmp", caseName);
    await rm(caseDir, { recursive: true, force: true });
    await mkdir(caseDir, { recursive: true });

    // Case files first — they take precedence
    await copyCase(caseName, caseDir);
    // Bundler template fills in the gaps (won't overwrite)
    await copyBundlerTemplate(bundler, caseDir);

    const start = Date.now();
    const passed = await runPlaywright(bundler, caseName);
    results.push({ bundler, caseName, passed, durationMs: Date.now() - start });
  }
  return results;
}

const results = (await Promise.all(bundlers.map(runBundlerCases))).flat();

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

printSummary(results);

const failures = results.filter((result) => !result.passed).length;
if (failures > 0) {
  console.error(styleText("red", `\n${failures} test suite(s) failed.`));
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function copyCase(caseName: string, caseDir: string): Promise<void> {
  const srcDir = join(e2eRoot, "cases", caseName);
  const entries = await readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === "test.ts") continue; // tests run from cases/, not .tmp/
    await cp(join(srcDir, entry.name), join(caseDir, entry.name), {
      recursive: true,
    });
  }
}

async function copyBundlerTemplate(
  bundler: string,
  caseDir: string,
): Promise<void> {
  await copyNewOnly(join(e2eRoot, "bundlers", bundler), caseDir);
}

// ---------------------------------------------------------------------------
// Summary tables
// ---------------------------------------------------------------------------

function formatDuration(ms: number): string {
  const secs = ms / 1000;
  if (secs < 60) return `${secs.toFixed(1)}s`;
  const minutes = Math.floor(secs / 60);
  const remainingSecs = (secs % 60).toFixed(1);
  return `${minutes}m ${remainingSecs}s`;
}

/** Strip ANSI escape codes to get the visible length of a string. */
function visibleLength(str: string): number {
  return str.replace(/\x1B\[\d+m/g, "").length;
}

/** Pad a string (that may contain ANSI codes) to the desired visible width. */
function padEndVisible(str: string, width: number): string {
  return str + " ".repeat(Math.max(0, width - visibleLength(str)));
}

function table(title: string, headers: string[], rows: string[][]): string {
  const colWidths = headers.map((header, colIndex) =>
    Math.max(header.length, ...rows.map((row) => visibleLength(row[colIndex]))),
  );

  const line = (fill: string, left: string, mid: string, right: string) =>
    left + colWidths.map((width) => fill.repeat(width + 2)).join(mid) + right;

  const row = (cells: string[]) =>
    "│" +
    cells
      .map(
        (cell, colIndex) =>
          " " + padEndVisible(cell, colWidths[colIndex]) + " ",
      )
      .join("│") +
    "│";

  const lines: string[] = [
    title,
    line("─", "┌", "┬", "┐"),
    row(headers),
    line("─", "├", "┼", "┤"),
    ...rows.map((rowData) => row(rowData)),
    line("─", "└", "┴", "┘"),
  ];
  return lines.join("\n");
}

function printSummary(results: Result[]): void {
  if (results.length === 0) return;

  console.log("\n");

  // Per-case tables
  const caseNames = [...new Set(results.map((result) => result.caseName))];
  for (const caseName of caseNames) {
    const caseResults = results.filter(
      (result) => result.caseName === caseName,
    );
    const rows = caseResults.map((result) => [
      result.bundler,
      result.passed ? styleText("green", "✔") : styleText("red", "✘"),
      formatDuration(result.durationMs),
    ]);
    console.log(table(caseName, ["Bundler", "Status", "Duration"], rows));
    console.log();
  }

  // Aggregate: average duration per bundler
  const bundlerNames = [...new Set(results.map((result) => result.bundler))];
  const avgRows = bundlerNames.map((bundlerName) => {
    const bundlerResults = results.filter(
      (result) => result.bundler === bundlerName,
    );
    const avg =
      bundlerResults.reduce((sum, result) => sum + result.durationMs, 0) /
      bundlerResults.length;
    return [bundlerName, formatDuration(avg)];
  });
  console.log(table("Average", ["Bundler", "Duration"], avgRows));
  console.log();

  // Aggregate: total duration + pass rate per bundler
  const totalRows = bundlerNames.map((bundlerName) => {
    const bundlerResults = results.filter(
      (result) => result.bundler === bundlerName,
    );
    const total = bundlerResults.reduce(
      (sum, result) => sum + result.durationMs,
      0,
    );
    const passed = bundlerResults.filter((result) => result.passed).length;
    return [
      bundlerName,
      formatDuration(total),
      `${passed}/${bundlerResults.length}`,
    ];
  });
  console.log(table("Total", ["Bundler", "Duration", "Passed"], totalRows));
}

/** Recursively copy src → dest, skipping EXCLUDED entries and existing files. */
async function copyNewOnly(src: string, dest: string): Promise<void> {
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    if (EXCLUDED.has(entry.name)) continue;
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await mkdir(destPath, { recursive: true });
      await copyNewOnly(srcPath, destPath);
    } else {
      try {
        await access(destPath); // already present — case file wins
      } catch {
        await cp(srcPath, destPath);
      }
    }
  }
}
