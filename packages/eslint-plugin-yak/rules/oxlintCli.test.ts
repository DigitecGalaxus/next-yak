import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const oxlintBin = join(dirname(require.resolve("oxlint/package.json")), "bin/oxlint");
const fixtureDirectory = fileURLToPath(new URL("./fixtures/oxlint-cli/", import.meta.url));

describe("Oxlint CLI integration", () => {
  it("loads the package and resets import state between files", () => {
    const result = spawnSync(oxlintBin, ["--config", "config.json", "--format", "json", "."], {
      cwd: fixtureDirectory,
      encoding: "utf8",
    });

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);

    const diagnostics = JSON.parse(result.stdout).diagnostics as Array<{
      code: string;
      filename: string;
    }>;
    expect(
      diagnostics
        .filter((diagnostic) => diagnostic.code === "yak(css-nesting-operator)")
        .map(({ code, filename }) => ({ code, filename })),
    ).toEqual([
      {
        code: "yak(css-nesting-operator)",
        filename: "input.ts",
      },
    ]);
  });
});
