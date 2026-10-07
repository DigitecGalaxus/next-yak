/**
 * Every e2e case follows one layout, so the runner's file discovery
 * (copyCase in e2eEnvironment.ts, which knows the framework markers) sees
 * what the author meant:
 *
 *   cases/<case>/index.tsx            the React case, required
 *   cases/<case>/index.test.ts        the shared test, required
 *   cases/<case>/index.<fw>.tsx       the case for every other framework, required
 *   cases/<case>/<name>.<fw>.<ext>    a variant of <name>.<ext> for framework <fw>,
 *                                     whose React twin must exist
 *
 * A variant replaces its React twin during assembly, so a variant without a
 * twin would run on one framework only and never on React. Any other marker
 * in a file name is a typo the runner would silently ship to every bundler.
 */

import { existsSync, globSync } from "node:fs";
import { basename, dirname, join } from "node:path";

const casesDir = join(import.meta.dirname, "cases");

/** the frameworks besides React that a file name may carry as a marker */
const FRAMEWORK_MARKERS = ["solid", "qwik"];

/** cases that run on React only, on purpose */
const REACT_ONLY = new Set(["no-style-module"]);

/** Exits with one line per problem; silent when the layout is right */
export function checkCaseLayout(): void {
  const problems: string[] = [];

  for (const dir of globSync("*/", { cwd: casesDir })) {
    for (const required of ["index.tsx", "index.test.ts"]) {
      if (!existsSync(join(casesDir, dir, required))) problems.push(`${dir}: missing ${required}`);
    }
    // every framework runs every case: a case without a variant would pass
    // on one framework only and never show what the others do
    if (REACT_ONLY.has(dir.replace(/\/$/, ""))) continue;
    for (const framework of FRAMEWORK_MARKERS) {
      const variant = `index.${framework}.tsx`;
      if (!existsSync(join(casesDir, dir, variant))) problems.push(`${dir}: missing ${variant}`);
    }
  }

  for (const file of globSync("**/*.*.*", { cwd: casesDir })) {
    const name = basename(file);
    const markers = name
      .split(".")
      .slice(1, -1)
      .filter((part) => /^[a-z]+$/.test(part));
    for (const marker of markers) {
      if (FRAMEWORK_MARKERS.includes(marker)) {
        const twin = join(dirname(file), name.replace(`.${marker}.`, "."));
        if (!existsSync(join(casesDir, twin))) {
          problems.push(`${file}: no React twin ${basename(twin)}`);
        }
      } else if (marker !== "test" && marker !== "yak") {
        const known = FRAMEWORK_MARKERS.map((fw) => `".${fw}."`).join(" and ");
        problems.push(
          `${file}: unknown marker ".${marker}." (${known} are the framework variants)`,
        );
      }
    }
  }

  if (problems.length > 0) {
    console.error("e2e case layout:\n" + problems.map((line) => `  ${line}`).join("\n"));
    process.exit(1);
  }
}
