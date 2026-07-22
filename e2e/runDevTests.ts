/**
 * Run e2e tests against dev servers.
 *
 * Usage: node runDevTests.ts [bundler] [case]
 */

import {
  discoverBundlers,
  discoverCases,
  parseCLIArgs,
  runBundlerCases,
  printSummary,
  printFoldMode,
} from "./e2eEnvironment.ts";

printFoldMode("dev tests");

const discoveredBundlers = await discoverBundlers();
const allCases = await discoverCases();
const { bundlers, cases } = parseCLIArgs(discoveredBundlers, allCases);

const isCI = !!process.env.CI;
let results;
if (isCI) {
  // Run sequentially in CI to avoid resource contention
  results = [];
  for (const bundler of bundlers) {
    results.push(...(await runBundlerCases(bundler, cases, { script: "dev" }, discoveredBundlers)));
  }
} else {
  results = (
    await Promise.all(
      bundlers.map((b) => runBundlerCases(b, cases, { script: "dev" }, discoveredBundlers)),
    )
  ).flat();
}

printSummary(results);

const failures = results.filter((r) => !r.passed).length;
if (failures > 0) {
  console.error(`\n${failures} test suite(s) failed.`);
  process.exit(1);
}
