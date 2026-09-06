/**
 * Every e2e case follows one layout, so the runner's file discovery
 * (copyCase in e2eEnvironment.ts, which only knows the `.solid.` marker) sees
 * what the author meant:
 *
 *   cases/<case>/index.tsx          the React case, required
 *   cases/<case>/index.test.ts      the shared test, required
 *   cases/<case>/<name>.solid.<ext> a Solid variant of <name>.<ext>, which must exist
 *
 * A Solid variant replaces its React twin during assembly, so a variant
 * without a twin would run on Solid only and never on React. Any other
 * framework marker in a file name is a typo the runner would silently ship
 * to every bundler.
 */

import { existsSync, globSync } from "node:fs";
import { basename, dirname, join } from "node:path";

const casesDir = join(import.meta.dirname, "cases");

/** Exits with one line per problem; silent when the layout is right */
export function checkCaseLayout(): void {
  const problems: string[] = [];

  for (const dir of globSync("*/", { cwd: casesDir })) {
    for (const required of ["index.tsx", "index.test.ts"]) {
      if (!existsSync(join(casesDir, dir, required))) problems.push(`${dir}: missing ${required}`);
    }
  }

  for (const file of globSync("**/*.*.*", { cwd: casesDir })) {
    const name = basename(file);
    const markers = name
      .split(".")
      .slice(1, -1)
      .filter((part) => /^[a-z]+$/.test(part));
    for (const marker of markers) {
      if (marker === "solid") {
        const twin = join(dirname(file), name.replace(".solid.", "."));
        if (!existsSync(join(casesDir, twin))) {
          problems.push(`${file}: no React twin ${basename(twin)}`);
        }
      } else if (marker !== "test" && marker !== "yak") {
        problems.push(
          `${file}: unknown marker ".${marker}." (only ".solid." is a framework variant)`,
        );
      }
    }
  }

  if (problems.length > 0) {
    console.error("e2e case layout:\n" + problems.map((line) => `  ${line}`).join("\n"));
    process.exit(1);
  }
}
