/**
 * E2E test orchestrator.
 *
 * For each bundler, assembles a self-contained app in
 * bundlers/<bundler>/.tmp/ with ALL cases mounted as routes,
 * starts ONE dev server, and runs Playwright for each case.
 *
 * Template files in bundler directories use [case-name] as a placeholder
 * in both file paths and file contents. During assembly, these are expanded
 * once per test case (e.g. app/[case-name]/page.tsx → app/styled-basic/page.tsx).
 *
 * Usage: node run.ts [bundler] [case]
 */

import { execSync, spawn, type ChildProcess } from "node:child_process";
import {
  readdir,
  rm,
  mkdir,
  access,
  cp,
  readFile,
  writeFile,
} from "node:fs/promises";
import { createConnection } from "node:net";
import { join, resolve, relative } from "node:path";
import { styleText } from "node:util";

const e2eRoot = import.meta.dirname;

// ---------------------------------------------------------------------------
// Process cleanup — recursive tree kill for reliable shutdown
// ---------------------------------------------------------------------------

const activeChildren = new Set<ChildProcess>();

/** Recursively find all descendant PIDs of a process. */
function getDescendants(pid: number): number[] {
  try {
    const output = execSync(`pgrep -P ${pid}`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
    const children = output.split("\n").map(Number).filter(Boolean);
    return [...children, ...children.flatMap(getDescendants)];
  } catch {
    return [];
  }
}

/** SIGKILL a process and all its descendants (bottom-up). */
function killTree(pid: number) {
  if (process.platform === "win32") {
    spawn("taskkill", ["/T", "/F", "/PID", String(pid)]);
    return;
  }
  const pids = [...getDescendants(pid), pid];
  for (const p of pids) {
    try {
      process.kill(p, "SIGKILL");
    } catch {
      // already exited
    }
  }
}

/** Kill all tracked child processes (and their process trees). */
function killAllChildren() {
  for (const child of activeChildren) {
    if (child.pid) killTree(child.pid);
  }
  activeChildren.clear();
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    console.log(styleText("yellow", `\nReceived ${signal}, shutting down…`));
    killAllChildren();
    process.exit(128 + (signal === "SIGINT" ? 2 : 15));
  });
}

process.on("exit", killAllChildren);

// ---------------------------------------------------------------------------

const COLORS = ["cyan", "magenta", "yellow", "blue", "green", "red"] as const;

/** Bundler-dir entries that should never be copied into .tmp */
const EXCLUDED = new Set([
  ".tmp",
  "node_modules",
  "test-results",
  "package.json",
  "playwright.config.ts",
  ".next",
  ".swc",
]);

/** File extensions where [case-name] is replaced in content */
const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".mjs",
  ".js",
  ".jsx",
  ".html",
  ".json",
  ".css",
]);

const CASE_NAME_PLACEHOLDER = "[case-name]";

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

/** Find all bundler dirs that have a playwright.config.ts */
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

/** Find all test case directories */
const caseEntries = await readdir(join(e2eRoot, "cases"), {
  withFileTypes: true,
});
const allCases = caseEntries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const bundlers = process.argv[2] ? [process.argv[2]] : discoveredBundlers;
const cases = process.argv[3] ? [process.argv[3]] : allCases;

interface Result {
  bundler: string;
  caseName: string;
  passed: boolean;
  durationMs: number;
}

/** Spawn Playwright for a single case against an already-running server. */
function runPlaywright(bundler: string, caseName: string): Promise<boolean> {
  return new Promise((resolve) => {
    const color = COLORS[discoveredBundlers.indexOf(bundler) % COLORS.length];
    const prefix = styleText(color, `[${bundler}/${caseName}]`);
    const child = spawn(
      `pnpm exec playwright test --config bundlers/${bundler}/playwright.config.ts`,
      {
        cwd: e2eRoot,
        env: { ...process.env, BUNDLER: bundler, CASE: caseName },
        stdio: "pipe",
        shell: true,
      },
    );

    activeChildren.add(child);

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

    child.on("close", (code) => {
      activeChildren.delete(child);
      resolve(code === 0);
    });
  });
}

// ---------------------------------------------------------------------------
// Assembly — builds .tmp/ with all cases for a bundler
// ---------------------------------------------------------------------------

/**
 * Create the .tmp/ directory for a bundler with all cases mounted as routes.
 *
 * 1. Copies each case's source files into .tmp/cases/<case-name>/
 * 2. Expands bundler template files — files with [case-name] in their path
 *    are duplicated per case with the placeholder replaced in both path and
 *    content; other files are copied once as shared files.
 */
async function assembleBundler(
  bundler: string,
  caseNames: string[],
): Promise<void> {
  const tmpDir = resolve(e2eRoot, "bundlers", bundler, ".tmp");
  await rm(tmpDir, { recursive: true, force: true });
  await mkdir(tmpDir, { recursive: true });

  // Copy all case files into .tmp/cases/<case-name>/
  for (const caseName of caseNames) {
    const caseDest = join(tmpDir, "cases", caseName);
    await mkdir(caseDest, { recursive: true });
    await copyCase(caseName, caseDest);
  }

  // Expand bundler template files into .tmp/
  await expandBundlerTemplates(bundler, tmpDir, caseNames);
}

/** Copy a case's source files (except test.ts) into the destination directory. */
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

/**
 * Walk the bundler template directory and copy files into .tmp/.
 *
 * Files/dirs with [case-name] in their path are "per-case templates" —
 * expanded once per case with the placeholder replaced in path and content.
 * All other files are "shared" and copied once.
 */
async function expandBundlerTemplates(
  bundler: string,
  tmpDir: string,
  caseNames: string[],
): Promise<void> {
  const bundlerDir = join(e2eRoot, "bundlers", bundler);
  await walkAndExpand(bundlerDir, bundlerDir, tmpDir, caseNames);
}

/** Recursively walk src, expanding [case-name] templates into dest. */
async function walkAndExpand(
  rootDir: string,
  currentDir: string,
  tmpDir: string,
  caseNames: string[],
): Promise<void> {
  const entries = await readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    if (EXCLUDED.has(entry.name)) continue;

    const srcPath = join(currentDir, entry.name);
    const relPath = relative(rootDir, srcPath);

    if (entry.isDirectory() && relPath.includes(CASE_NAME_PLACEHOLDER)) {
      // Template directory — recurse; children inherit [case-name] in their path
      await walkAndExpand(rootDir, srcPath, tmpDir, caseNames);
    } else if (
      !entry.isDirectory() &&
      relPath.includes(CASE_NAME_PLACEHOLDER)
    ) {
      // Template file — create one copy per case
      for (const caseName of caseNames) {
        const expandedRel = relPath.replaceAll(CASE_NAME_PLACEHOLDER, caseName);
        const destPath = join(tmpDir, expandedRel);
        await mkdir(join(destPath, ".."), { recursive: true });
        await copyWithExpansion(srcPath, destPath, caseName);
      }
    } else if (entry.isDirectory()) {
      // Shared directory — recurse
      await mkdir(join(tmpDir, relPath), { recursive: true });
      await walkAndExpand(rootDir, srcPath, tmpDir, caseNames);
    } else {
      // Shared file — copy once (don't overwrite case files)
      const destPath = join(tmpDir, relPath);
      try {
        await access(destPath);
      } catch {
        await cp(srcPath, destPath);
      }
    }
  }
}

/** Copy a file, replacing [case-name] in text file contents. */
async function copyWithExpansion(
  srcPath: string,
  destPath: string,
  caseName: string,
): Promise<void> {
  const ext = srcPath.substring(srcPath.lastIndexOf("."));
  if (TEXT_EXTENSIONS.has(ext)) {
    const content = await readFile(srcPath, "utf-8");
    await writeFile(
      destPath,
      content.replaceAll(CASE_NAME_PLACEHOLDER, caseName),
    );
  } else {
    await cp(srcPath, destPath);
  }
}

// ---------------------------------------------------------------------------
// Dev server lifecycle
// ---------------------------------------------------------------------------

/** Read the port from the bundler's playwright.config.ts. */
async function readPort(bundler: string): Promise<number> {
  const configPath = join(e2eRoot, "bundlers", bundler, "playwright.config.ts");
  const configModule = await import(configPath);
  const config = configModule.default;
  // Playwright's defineConfig returns the object as-is
  return config.webServer.port;
}

/** Read the package name from the bundler's package.json. */
async function readPackageName(bundler: string): Promise<string> {
  const pkgPath = join(e2eRoot, "bundlers", bundler, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf-8"));
  return pkg.name;
}

/** Start the bundler's dev server via its package.json "dev" script. */
function startDevServer(bundler: string, packageName: string): ChildProcess {
  const color = COLORS[discoveredBundlers.indexOf(bundler) % COLORS.length];
  const prefix = styleText(color, `[${bundler}/server]`);

  const child = spawn(`pnpm --filter=${packageName} dev`, {
    cwd: resolve(e2eRoot, ".."),
    stdio: "pipe",
    shell: true,
    detached: true,
  });

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

  if (!child.pid) {
    throw new Error(`Failed to start dev server for ${bundler}`);
  }

  activeChildren.add(child);
  child.on("close", () => activeChildren.delete(child));

  return child;
}

/** Wait for a TCP port to accept connections. */
function waitForPort(port: number, timeoutMs = 120_000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function tryConnect() {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Timed out waiting for port ${port}`));
        return;
      }
      const socket = createConnection({ port, host: "localhost" }, () => {
        socket.destroy();
        resolve();
      });
      socket.on("error", () => {
        socket.destroy();
        setTimeout(tryConnect, 500);
      });
    }
    tryConnect();
  });
}

/** Kill a single server process tree and wait for it to exit. */
function killServer(child: ChildProcess): Promise<void> {
  return new Promise((resolve) => {
    if (child.killed || child.exitCode !== null) {
      resolve();
      return;
    }
    child.on("close", () => resolve());

    if (!child.pid) {
      resolve();
      return;
    }

    killTree(child.pid);
  });
}

// ---------------------------------------------------------------------------
// Run all cases for a bundler against a single dev server
// ---------------------------------------------------------------------------

/**
 * Assemble all cases, start one dev server, run Playwright per case, then
 * tear down the server.
 */
async function runBundlerCases(bundler: string): Promise<Result[]> {
  await assembleBundler(bundler, cases);

  const port = await readPort(bundler);
  const packageName = await readPackageName(bundler);
  const server = startDevServer(bundler, packageName);

  try {
    await waitForPort(port);

    const results: Result[] = [];
    for (const caseName of cases) {
      const start = Date.now();
      const passed = await runPlaywright(bundler, caseName);
      results.push({
        bundler,
        caseName,
        passed,
        durationMs: Date.now() - start,
      });
    }
    return results;
  } finally {
    await killServer(server);
  }
}

const isCI = !!process.env.CI;
let results: Result[];
if (isCI) {
  // Run sequentially in CI to avoid resource contention
  results = [];
  for (const bundler of bundlers) {
    results.push(...(await runBundlerCases(bundler)));
  }
} else {
  results = (await Promise.all(bundlers.map(runBundlerCases))).flat();
}

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
// Summary tables
// ---------------------------------------------------------------------------

/** Format milliseconds as human-readable duration. */
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

/** Render a formatted ASCII table with a title row. */
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

/** Print per-case and aggregate result tables. */
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
