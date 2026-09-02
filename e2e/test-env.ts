/**
 * Test helper that gives each Playwright test access to the case files dir.
 *
 * Wraps the test body so it receives a `TestEnv` object for reading/writing
 * files in the running dev server's case directory. Modified files are
 * automatically restored after the test (important for HMR tests that mutate
 * source files).
 */

declare global {
  interface Window {
    /** Set by HMR tests to detect full page reloads */
    __hmr?: true | false | null;
  }
}

import { readFile, writeFile, copyFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import type { Page, TestInfo } from "@playwright/test";

export interface TestEnv {
  /** Absolute path to the .tmp/cases/<case> dir */
  cwd: string;
  /** URL path to navigate to */
  url: string;
  /** Directory name under bundlers/ identifying the bundler being tested */
  bundlerDirName: string;
  /** UI framework the bundler renders with (see playwright-base.ts) */
  framework: "react" | "solid";
  readFile(rel: string): Promise<string>;
  writeFile(rel: string, content: string): Promise<void>;
  /** Restore a file from the original case source */
  resetFile(rel: string): Promise<void>;
}

/** "index.tsx" -> "index.solid.tsx" (matches the copyCase rename in e2eEnvironment.ts) */
function frameworkVariantName(rel: string, framework: string): string {
  const slash = rel.lastIndexOf("/") + 1;
  const dot = rel.indexOf(".", slash);
  return dot === -1 ? rel : `${rel.slice(0, dot)}.${framework}${rel.slice(dot)}`;
}

const e2eRoot = import.meta.dirname;

export function withTestEnv(caseName: string, fn: (testEnv: TestEnv, page: Page) => Promise<void>) {
  return async ({ page }: { page: Page }, testInfo: TestInfo) => {
    const metadata = testInfo.project.metadata as {
      bundlerDirName?: string;
      framework?: "react" | "solid";
    };
    const bundlerDirName = metadata.bundlerDirName ?? testInfo.project.name;
    const framework = metadata.framework ?? "react";
    const tmpDir = resolve(e2eRoot, "bundlers", bundlerDirName, ".tmp", "cases", caseName);
    const srcDir = resolve(e2eRoot, "cases", caseName);

    const originals = new Map<string, string>();

    const testEnv: TestEnv = {
      cwd: tmpDir,
      url: (testInfo.project.metadata as { url: string }).url,
      bundlerDirName,
      framework,
      async readFile(rel: string) {
        return readFile(join(tmpDir, rel), "utf-8");
      },
      async writeFile(rel: string, content: string) {
        if (!originals.has(rel)) {
          try {
            originals.set(rel, await readFile(join(tmpDir, rel), "utf-8"));
          } catch {
            // file didn't exist before
          }
        }
        await writeFile(join(tmpDir, rel), content);
      },
      async resetFile(rel: string) {
        if (framework !== "react") {
          // The .tmp file may have been assembled from a framework variant
          try {
            await copyFile(join(srcDir, frameworkVariantName(rel, framework)), join(tmpDir, rel));
            return;
          } catch {
            // No variant — the react source was shared as-is
          }
        }
        await copyFile(join(srcDir, rel), join(tmpDir, rel));
      },
    };

    try {
      await fn(testEnv, page);
    } finally {
      for (const [rel, original] of originals) {
        await writeFile(join(tmpDir, rel), original).catch(() => {});
      }
    }
  };
}
