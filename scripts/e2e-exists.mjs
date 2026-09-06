// Checks that every e2e case follows one layout, so the runner's file
// discovery (e2e/e2eEnvironment.ts) sees what the author meant:
//
//   e2e/cases/<case>/index.tsx          the React case, required
//   e2e/cases/<case>/index.test.ts      the shared test, required
//   e2e/cases/<case>/<name>.solid.<ext> a Solid variant of <name>.<ext>, which must exist
//
// A Solid variant replaces its React twin during assembly, so a variant
// without a twin would run on Solid only and never on React. Any other
// framework marker in a file name is a typo the runner would silently ship
// to every bundler.
import { globSync, existsSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";

const root = new URL("../e2e/cases/", import.meta.url).pathname;
const problems = [];

for (const dir of globSync("*/", { cwd: root })) {
  const caseDir = join(root, dir);
  for (const required of ["index.tsx", "index.test.ts"]) {
    if (!existsSync(join(caseDir, required))) problems.push(`${dir}: missing ${required}`);
  }
}

for (const file of globSync("**/*.*.*", { cwd: root })) {
  const name = basename(file);
  const markers = name
    .split(".")
    .slice(1, -1)
    .filter((part) => /^[a-z]+$/.test(part));
  // the runner only knows the solid marker (see copyCase in e2eEnvironment.ts)
  for (const marker of markers) {
    if (marker === "solid") {
      const twin = join(dirname(file), name.replace(".solid.", "."));
      if (!existsSync(join(root, twin))) problems.push(`${file}: no React twin ${basename(twin)}`);
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
console.log(
  `e2e case layout ok (${globSync("*/", { cwd: root }).length} cases in ${relative(process.cwd(), root)})`,
);
