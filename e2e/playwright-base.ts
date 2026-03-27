/**
 * Shared Playwright config factory for bundler-specific configs.
 *
 * Supports two modes:
 * - Batch mode (CASES env var, comma-separated): one project per case, parallel workers
 * - Single mode (CASE env var): one project, single worker (used for HMR tests)
 */

import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";

interface BundlerPlaywrightConfig {
  name: string;
  /** URL pattern with [case-name] placeholder (e.g. "/[case-name]" or "/[case-name].html") */
  urlPattern: string;
  /** Port the server listens on (managed by e2eEnvironment.ts) */
  port: number;
}

export function basePlaywrightConfig(config: BundlerPlaywrightConfig) {
  const e2eRoot = import.meta.dirname;

  // CASES (comma-separated) for batch mode, CASE for single-case (HMR) mode
  const caseList = process.env.CASES
    ? process.env.CASES.split(",")
    : [process.env.CASE ?? "__placeholder__"];

  const isBatch = caseList.length > 1;

  const projects = caseList.map((caseName) => ({
    name: isBatch ? `${config.name}/${caseName}` : config.name,
    testDir: resolve(e2eRoot, "cases", caseName),
    testMatch: "index.test.ts",
    metadata: {
      url: config.urlPattern.replaceAll("[case-name]", caseName),
      urlPattern: config.urlPattern,
      bundlerName: config.name,
    },
    use: { baseURL: `http://localhost:${config.port}` },
  }));

  return defineConfig({
    workers: isBatch ? undefined : 1,
    projects,

    webServer: {
      // Playwright requires a webServer.command, but e2eEnvironment.ts manages the actual
      // server externally. This no-op command + reuseExistingServer tells
      // Playwright to verify the port is already open instead of starting one.
      command: "echo 'server managed by e2eEnvironment.ts'",
      port: config.port,
      reuseExistingServer: true,
    },
  });
}
