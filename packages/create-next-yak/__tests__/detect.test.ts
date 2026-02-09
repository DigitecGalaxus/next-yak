import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { detectProject, isAlreadyConfigured } from "../src/detect.ts";

describe("detectProject", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "create-next-yak-test-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("detects Next.js project with pnpm", () => {
    writeFileSync(
      join(tempDir, "package.json"),
      JSON.stringify({ dependencies: { next: "^14.0.0", react: "^18.0.0" } })
    );
    writeFileSync(join(tempDir, "pnpm-lock.yaml"), "");
    writeFileSync(join(tempDir, "next.config.mjs"), "export default {}");

    const result = detectProject(tempDir);
    expect(result.type).toBe("next");
    expect(result.packageManager).toBe("pnpm");
    expect(result.configFile).toBe("next.config.mjs");
  });

  it("detects Vite project with npm", () => {
    writeFileSync(
      join(tempDir, "package.json"),
      JSON.stringify({ devDependencies: { vite: "^5.0.0" } })
    );
    writeFileSync(join(tempDir, "package-lock.json"), "{}");
    writeFileSync(
      join(tempDir, "vite.config.ts"),
      'import { defineConfig } from "vite";\nexport default defineConfig({});'
    );

    const result = detectProject(tempDir);
    expect(result.type).toBe("vite");
    expect(result.packageManager).toBe("npm");
    expect(result.configFile).toBe("vite.config.ts");
  });

  it("prefers next over vite when both are present", () => {
    writeFileSync(
      join(tempDir, "package.json"),
      JSON.stringify({
        dependencies: { next: "^14.0.0", vite: "^5.0.0" },
      })
    );
    writeFileSync(join(tempDir, "next.config.ts"), "export default {}");

    const result = detectProject(tempDir);
    expect(result.type).toBe("next");
  });

  it("returns null configFile when none exists", () => {
    writeFileSync(
      join(tempDir, "package.json"),
      JSON.stringify({ dependencies: { next: "^14.0.0" } })
    );

    const result = detectProject(tempDir);
    expect(result.configFile).toBeNull();
  });

  it("throws when no package.json", () => {
    expect(() => detectProject(tempDir)).toThrow("No package.json found");
  });

  it("throws when no framework detected", () => {
    writeFileSync(
      join(tempDir, "package.json"),
      JSON.stringify({ dependencies: { express: "^4.0.0" } })
    );

    expect(() => detectProject(tempDir)).toThrow(
      "Could not detect project type"
    );
  });

  it("detects yarn", () => {
    writeFileSync(
      join(tempDir, "package.json"),
      JSON.stringify({ dependencies: { next: "^14.0.0" } })
    );
    writeFileSync(join(tempDir, "yarn.lock"), "");

    expect(detectProject(tempDir).packageManager).toBe("yarn");
  });

  it("detects bun", () => {
    writeFileSync(
      join(tempDir, "package.json"),
      JSON.stringify({ dependencies: { next: "^14.0.0" } })
    );
    writeFileSync(join(tempDir, "bun.lock"), "");

    expect(detectProject(tempDir).packageManager).toBe("bun");
  });

  it("defaults to npm when no lockfile", () => {
    writeFileSync(
      join(tempDir, "package.json"),
      JSON.stringify({ dependencies: { next: "^14.0.0" } })
    );

    expect(detectProject(tempDir).packageManager).toBe("npm");
  });
});

describe("isAlreadyConfigured", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "create-next-yak-test-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("returns true when next-yak is already in config", () => {
    writeFileSync(
      join(tempDir, "next.config.mjs"),
      'import { withYak } from "next-yak/withYak";\nexport default withYak({});'
    );

    expect(isAlreadyConfigured(tempDir, "next.config.mjs")).toBe(true);
  });

  it("returns false when next-yak is not in config", () => {
    writeFileSync(
      join(tempDir, "next.config.mjs"),
      "export default { reactStrictMode: true };"
    );

    expect(isAlreadyConfigured(tempDir, "next.config.mjs")).toBe(false);
  });
});
