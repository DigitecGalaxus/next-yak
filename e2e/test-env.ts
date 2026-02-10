/**
 * Test helper that gives each Playwright test access to the .tmp/<case>/ dir.
 *
 * Wraps the test body so it receives an `FsTmp` object for reading/writing
 * files in the running dev server's directory. Modified files are automatically
 * restored after the test (important for HMR tests that mutate source files).
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

export interface FsTmp {
  /** Absolute path to the .tmp/<case> dir */
  cwd: string;
  /** URL path to navigate to */
  url: string;
  /** The bundler being tested */
  bundlerName: string;
  readFile(rel: string): Promise<string>;
  writeFile(rel: string, content: string): Promise<void>;
  /** Restore a file from the original case source */
  resetFile(rel: string): Promise<void>;
}

const e2eRoot = import.meta.dirname;

export function withTestEnv(
  caseName: string,
  fn: (fsTmp: FsTmp, page: Page) => Promise<void>,
) {
  return async ({ page }: { page: Page }, testInfo: TestInfo) => {
    const bundlerName = testInfo.project.name;
    const tmpDir = resolve(e2eRoot, "bundlers", bundlerName, ".tmp", caseName);
    const srcDir = resolve(e2eRoot, "cases", caseName);

    const originals = new Map<string, string>();

    const fsTmp: FsTmp = {
      cwd: tmpDir,
      url: (testInfo.project.metadata as { url: string }).url,
      bundlerName,
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
        await copyFile(join(srcDir, rel), join(tmpDir, rel));
      },
    };

    try {
      await fn(fsTmp, page);
    } finally {
      for (const [rel, original] of originals) {
        await writeFile(join(tmpDir, rel), original).catch(() => {});
      }
    }
  };
}
