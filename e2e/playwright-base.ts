/**
 * Shared Playwright config factory for bundler-specific configs.
 *
 * Each bundler's playwright.config.ts calls this with its dev server
 * command and port. The CASE env var (set by run.ts) determines which
 * case directory to test.
 */

import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";

interface BundlerPlaywrightConfig {
  name: string;
  /** URL path tests navigate to (e.g. "/index.html" or "/") */
  url: string;
  webServer: {
    port: number;
    command: string;
    timeout: number;
  };
}

export function basePlaywrightConfig(config: BundlerPlaywrightConfig) {
  const caseName = process.env.CASE;
  if (!caseName) throw new Error("CASE env var is required");

  const e2eRoot = import.meta.dirname;
  const tmpDir = resolve(e2eRoot, "bundlers", config.name, ".tmp", caseName);

  return defineConfig({
    testDir: resolve(e2eRoot, "cases", caseName),
    testMatch: "test.ts",
    workers: 1,

    projects: [
      {
        name: config.name,
        use: { baseURL: `http://localhost:${config.webServer.port}` },
        metadata: { url: config.url },
      },
    ],

    webServer: {
      command: config.webServer.command,
      cwd: tmpDir,
      port: config.webServer.port,
      reuseExistingServer: false,
      timeout: config.webServer.timeout,
    },
  });
}
