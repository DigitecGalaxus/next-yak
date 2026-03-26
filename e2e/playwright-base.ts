/**
 * Shared Playwright config factory for bundler-specific configs.
 *
 * Each bundler's playwright.config.ts calls this with its dev server
 * details. The CASE env var (set by run.ts) determines which case to test.
 * The dev server is managed by run.ts — Playwright reuses it.
 */

import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";

interface BundlerPlaywrightConfig {
  name: string;
  /** URL pattern with [case-name] placeholder (e.g. "/[case-name]" or "/[case-name].html") */
  urlPattern: string;
  /** Port the dev server listens on (managed by run.ts) */
  port: number;
}

export function basePlaywrightConfig(config: BundlerPlaywrightConfig) {
  // CASE may be unset when run.ts imports this config just to read the port
  const caseName = process.env.CASE ?? "__placeholder__";

  const e2eRoot = import.meta.dirname;
  const url = config.urlPattern.replaceAll("[case-name]", caseName);

  return defineConfig({
    testDir: resolve(e2eRoot, "cases", caseName),
    testMatch: "test.ts",
    workers: 1,

    projects: [
      {
        name: config.name,
        use: { baseURL: `http://localhost:${config.port}` },
        metadata: { url, urlPattern: config.urlPattern },
      },
    ],

    webServer: {
      // Playwright requires a webServer.command, but run.ts manages the actual
      // dev server externally. This no-op command + reuseExistingServer tells
      // Playwright to verify the port is already open instead of starting one.
      command: "echo 'server managed by run.ts'",
      port: config.port,
      reuseExistingServer: true,
    },
  });
}
