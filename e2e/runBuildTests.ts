/**
 * Run e2e tests against production builds.
 *
 * Builds each bundler's app, starts a production server, and runs all
 * non-HMR test cases against it.
 *
 * Usage: node runBuildTests.ts [bundler] [case]
 */

import {
  discoverBundlers,
  discoverCases,
  parseCLIArgs,
  runBundlerCases,
  printSummary,
} from "./e2eEnvironment.ts";

const discoveredBundlers = await discoverBundlers();
const allCases = await discoverCases();
const { bundlers, cases } = parseCLIArgs(discoveredBundlers, allCases);

// HMR tests don't apply to production builds
const buildCases = cases.filter((c) => !c.startsWith("hmr-"));

// Run sequentially — builds are resource-heavy
const results = [];
for (const bundler of bundlers) {
  results.push(
    ...(await runBundlerCases(
      bundler,
      buildCases,
      { buildScript: "build", script: "start" },
      discoveredBundlers,
    )),
  );
}

printSummary(results);

const failures = results.filter((r) => !r.passed).length;
if (failures > 0) {
  console.error(`\n${failures} test suite(s) failed.`);
  process.exit(1);
}
