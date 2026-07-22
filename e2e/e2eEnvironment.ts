/**
 * Shared e2e test infrastructure.
 *
 * Provides assembly, server lifecycle, Playwright runner, and summary
 * reporting used by both runDevTests.ts and runBuildTests.ts.
 */

import { execSync, spawn, type ChildProcess } from "node:child_process";
import { readdir, rm, mkdir, access, cp, readFile, writeFile } from "node:fs/promises";
import { createConnection } from "node:net";
import { join, resolve, relative } from "node:path";
import { styleText } from "node:util";

export const e2eRoot = import.meta.dirname;

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
// Constants
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
const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".mjs", ".js", ".jsx", ".html", ".json", ".css"]);

const CASE_NAME_PLACEHOLDER = "[case-name]";

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

/** Find all bundler dirs that have a playwright.config.ts */
export async function discoverBundlers(): Promise<string[]> {
  const bundlerEntries = await readdir(join(e2eRoot, "bundlers"), {
    withFileTypes: true,
  });
  const discovered: string[] = [];
  for (const entry of bundlerEntries) {
    if (!entry.isDirectory()) continue;
    try {
      await access(join(e2eRoot, "bundlers", entry.name, "playwright.config.ts"));
      discovered.push(entry.name);
    } catch {
      // No playwright config — not a bundler
    }
  }
  return discovered;
}

/** Find all test case directories */
export async function discoverCases(): Promise<string[]> {
  const caseEntries = await readdir(join(e2eRoot, "cases"), {
    withFileTypes: true,
  });
  return caseEntries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

/** Parse CLI args for [bundler] [case] filtering. */
export function parseCLIArgs(
  discoveredBundlers: string[],
  allCases: string[],
): { bundlers: string[]; cases: string[] } {
  const bundlers = process.argv[2] ? [process.argv[2]] : discoveredBundlers;
  const cases = process.argv[3] ? [process.argv[3]] : allCases;
  return { bundlers, cases };
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
export async function assembleBundler(bundler: string, caseNames: string[]): Promise<void> {
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

/** Copy a case's source files (except index.test.ts) into the destination directory. */
async function copyCase(caseName: string, caseDir: string): Promise<void> {
  const srcDir = join(e2eRoot, "cases", caseName);
  const entries = await readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === "index.test.ts") continue; // tests run from cases/, not .tmp/
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
    } else if (!entry.isDirectory() && relPath.includes(CASE_NAME_PLACEHOLDER)) {
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

/**
 * Parse named exports from a TypeScript/JavaScript file.
 * Handles: export const/let/var/function/class, export { ... }, export type/interface.
 * Does NOT return "default" (handled separately via `export { default }`).
 */
function parseNamedExports(source: string): string[] {
  const names = new Set<string>();
  // export const/let/var/function/class <name>
  for (const m of source.matchAll(/\bexport\s+(?:const|let|var|function|class)\s+(\w+)/g)) {
    names.add(m[1]);
  }
  // export { foo, bar as baz }  (from '...' or local)
  for (const m of source.matchAll(/\bexport\s*\{([^}]+)\}/g)) {
    for (const spec of m[1].split(",")) {
      const trimmed = spec.trim();
      if (!trimmed) continue;
      // "foo as bar" → export name is "bar"; "foo" → export name is "foo"
      const parts = trimmed.split(/\s+as\s+/);
      const exported = (parts[1] ?? parts[0]).trim();
      if (exported !== "default") names.add(exported);
    }
  }
  // export type/interface <name>
  for (const m of source.matchAll(/\bexport\s+(?:type|interface)\s+(\w+)/g)) {
    names.add(m[1]);
  }
  return [...names];
}

/**
 * Expand `export * from ".../[case-name]/index.tsx"` lines by resolving the
 * actual named exports from the case's index.tsx file. This avoids Next.js
 * errors about `export *` in page files while preserving the same exports.
 */
async function expandStarExports(content: string, caseName: string): Promise<string> {
  const starRe = /^export \* from\s+["']([^"']*\[case-name\][^"']*)["'];?\s*$/gm;
  let result = content;
  for (const match of content.matchAll(starRe)) {
    const specifier = match[1].replaceAll(CASE_NAME_PLACEHOLDER, caseName);
    // All import specifiers reference paths relative to .tmp/, which mirrors
    // the case layout under e2eRoot. Strip leading ../ segments and resolve
    // from e2eRoot to find the original source file.
    const cleaned = specifier.replace(/^(\.\.\/)+/, "");
    const resolvedPath = join(e2eRoot, cleaned);
    let replacement: string;
    try {
      const source = await readFile(resolvedPath, "utf-8");
      const names = parseNamedExports(source);
      if (names.length > 0) {
        replacement = `export { ${names.join(", ")} } from "${specifier}";`;
      } else {
        replacement = `// no named exports in ${caseName}/index.tsx`;
      }
    } catch {
      replacement = `// could not resolve exports for ${caseName}`;
    }
    result = result.replace(match[0], replacement);
  }
  return result;
}

/** Copy a file, replacing [case-name] in text file contents. */
async function copyWithExpansion(
  srcPath: string,
  destPath: string,
  caseName: string,
): Promise<void> {
  const ext = srcPath.substring(srcPath.lastIndexOf("."));
  if (TEXT_EXTENSIONS.has(ext)) {
    let content = await readFile(srcPath, "utf-8");
    content = await expandStarExports(content, caseName);
    content = content.replaceAll(CASE_NAME_PLACEHOLDER, caseName);
    await writeFile(destPath, content);
  } else {
    await cp(srcPath, destPath);
  }
}

// ---------------------------------------------------------------------------
// Server lifecycle
// ---------------------------------------------------------------------------

/** Read the port from the bundler's playwright.config.ts. */
export async function readPort(bundler: string): Promise<number> {
  const configPath = join(e2eRoot, "bundlers", bundler, "playwright.config.ts");
  const configModule = await import(configPath);
  const config = configModule.default;
  // Playwright's defineConfig returns the object as-is
  return config.webServer.port;
}

/** Read the package name from the bundler's package.json. */
export async function readPackageName(bundler: string): Promise<string> {
  const pkgPath = join(e2eRoot, "bundlers", bundler, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf-8"));
  return pkg.name;
}

/** Start a bundler server via a package.json script (e.g. "dev" or "start"). */
export function startServer(
  bundler: string,
  packageName: string,
  script: string,
  discoveredBundlers: string[],
): ChildProcess {
  const color = COLORS[discoveredBundlers.indexOf(bundler) % COLORS.length];
  const prefix = styleText(color, `[${bundler}/server]`);

  const child = spawn(`pnpm --filter=${packageName} ${script}`, {
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
    throw new Error(`Failed to start server for ${bundler}`);
  }

  activeChildren.add(child);
  child.on("close", () => activeChildren.delete(child));

  return child;
}

/** Wait for a TCP port to accept connections. */
export function waitForPort(port: number, timeoutMs = 120_000): Promise<void> {
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
export function killServer(child: ChildProcess): Promise<void> {
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

/** Run a pnpm script (e.g. "build") and wait for it to complete. */
export function runScript(
  bundler: string,
  packageName: string,
  script: string,
  discoveredBundlers: string[],
): Promise<void> {
  return new Promise((res, reject) => {
    const color = COLORS[discoveredBundlers.indexOf(bundler) % COLORS.length];
    const prefix = styleText(color, `[${bundler}/${script}]`);

    const child = spawn(`pnpm --filter=${packageName} ${script}`, {
      cwd: resolve(e2eRoot, ".."),
      stdio: "pipe",
      shell: true,
      detached: true,
    });

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
      if (code === 0) {
        res();
      } else {
        reject(new Error(`${script} failed for ${bundler} (exit code ${code})`));
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Playwright runner
// ---------------------------------------------------------------------------

export interface Result {
  bundler: string;
  caseName: string;
  passed: boolean;
  durationMs: number;
}

/** Spawn Playwright for a single case against an already-running server. */
export function runPlaywright(
  bundler: string,
  caseName: string,
  discoveredBundlers: string[],
): Promise<boolean> {
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
        detached: true,
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

/**
 * Spawn a single Playwright process that runs all given cases in parallel
 * (one Playwright project per case, multiple workers).
 */
export function runPlaywrightBatch(
  bundler: string,
  caseNames: string[],
  discoveredBundlers: string[],
): Promise<boolean> {
  return new Promise((resolve) => {
    const color = COLORS[discoveredBundlers.indexOf(bundler) % COLORS.length];
    const prefix = styleText(color, `[${bundler}]`);
    const child = spawn(
      `pnpm exec playwright test --config bundlers/${bundler}/playwright.config.ts`,
      {
        cwd: e2eRoot,
        env: {
          ...process.env,
          BUNDLER: bundler,
          CASES: caseNames.join(","),
        },
        stdio: "pipe",
        shell: true,
        detached: true,
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
// High-level runner
// ---------------------------------------------------------------------------

export interface RunOptions {
  /** The script to start the server (e.g. "dev" or "start") */
  script: string;
  /** Optional build script to run before starting the server (e.g. "build") */
  buildScript?: string;
}

/**
 * Assemble all cases, optionally build, start a server, run Playwright,
 * then tear down the server.
 *
 * Non-HMR cases run in a single batched Playwright process with parallel
 * workers. HMR cases run sequentially (one process each) since they modify
 * files on the dev server.
 */
export async function runBundlerCases(
  bundler: string,
  cases: string[],
  options: RunOptions,
  discoveredBundlers: string[],
): Promise<Result[]> {
  await assembleBundler(bundler, cases);

  const port = await readPort(bundler);
  const packageName = await readPackageName(bundler);

  if (options.buildScript) {
    await runScript(bundler, packageName, options.buildScript, discoveredBundlers);
  }

  const server = startServer(bundler, packageName, options.script, discoveredBundlers);

  try {
    await waitForPort(port);

    const results: Result[] = [];
    const hmrCases = cases.filter((c) => c.startsWith("hmr-"));
    const nonHmrCases = cases.filter((c) => !c.startsWith("hmr-"));

    // Batch all non-HMR cases in one Playwright process (parallel workers)
    if (nonHmrCases.length > 0) {
      const start = Date.now();
      const passed = await runPlaywrightBatch(bundler, nonHmrCases, discoveredBundlers);
      const durationMs = Date.now() - start;
      for (const caseName of nonHmrCases) {
        results.push({ bundler, caseName, passed, durationMs });
      }
    }

    // HMR cases run sequentially — they modify files on the dev server
    for (const caseName of hmrCases) {
      const start = Date.now();
      const passed = await runPlaywright(bundler, caseName, discoveredBundlers);
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
    cells.map((cell, colIndex) => " " + padEndVisible(cell, colWidths[colIndex]) + " ").join("│") +
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

/**
 * Whether static folding is on for this run. Controlled by
 * YAK_E2E_FOLD_STATIC: "false" runs the off pass, anything else keeps the
 * default (on).
 */
const foldStaticEnabled = process.env.YAK_E2E_FOLD_STATIC !== "false";

/** The colored on/off label for the active fold mode. */
export function foldModeLabel(): string {
  return foldStaticEnabled ? styleText("green", "on") : styleText("yellow", "off");
}

/** Print the active fold mode at startup so CI logs are unambiguous. */
export function printFoldMode(phase: string): void {
  console.log(`${phase} — fold mode: ${foldModeLabel()}`);
}

/** Print per-case and aggregate result tables. */
export function printSummary(results: Result[]): void {
  if (results.length === 0) return;

  console.log("\n");
  console.log(`fold mode: ${foldModeLabel()}`);

  // Per-case tables
  const caseNames = [...new Set(results.map((result) => result.caseName))];
  for (const caseName of caseNames) {
    const caseResults = results.filter((result) => result.caseName === caseName);
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
    const bundlerResults = results.filter((result) => result.bundler === bundlerName);
    const avg =
      bundlerResults.reduce((sum, result) => sum + result.durationMs, 0) / bundlerResults.length;
    return [bundlerName, formatDuration(avg)];
  });
  console.log(table("Average", ["Bundler", "Duration"], avgRows));
  console.log();

  // Aggregate: total duration + pass rate per bundler
  const totalRows = bundlerNames.map((bundlerName) => {
    const bundlerResults = results.filter((result) => result.bundler === bundlerName);
    const total = bundlerResults.reduce((sum, result) => sum + result.durationMs, 0);
    const passed = bundlerResults.filter((result) => result.passed).length;
    return [bundlerName, formatDuration(total), `${passed}/${bundlerResults.length}`];
  });
  console.log(table("Total", ["Bundler", "Duration", "Passed"], totalRows));
}
