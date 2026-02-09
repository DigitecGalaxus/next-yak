import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type ProjectType = "next" | "vite";
export type PackageManager = "pnpm" | "yarn" | "bun" | "npm";

export interface ProjectInfo {
  type: ProjectType;
  packageManager: PackageManager;
  configFile: string | null;
}

export function detectProject(cwd: string): ProjectInfo {
  return {
    type: detectProjectType(cwd),
    packageManager: detectPackageManager(cwd),
    configFile: detectConfigFile(cwd),
  };
}

function detectProjectType(cwd: string): ProjectType {
  const pkgPath = join(cwd, "package.json");
  if (!existsSync(pkgPath)) {
    throw new Error(
      "No package.json found. Run this command from the root of your project."
    );
  }
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };
  if ("next" in allDeps) return "next";
  if ("vite" in allDeps) return "vite";
  throw new Error(
    "Could not detect project type. Make sure you have next or vite in your dependencies."
  );
}

function detectPackageManager(cwd: string): PackageManager {
  const lockfiles: [string, PackageManager][] = [
    ["pnpm-lock.yaml", "pnpm"],
    ["yarn.lock", "yarn"],
    ["bun.lock", "bun"],
    ["package-lock.json", "npm"],
  ];
  for (const [file, manager] of lockfiles) {
    if (existsSync(join(cwd, file))) return manager;
  }
  return "npm";
}

function detectConfigFile(cwd: string): string | null {
  // Detect the project type first to know which config files to look for
  const pkgPath = join(cwd, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

  const configFiles =
    "next" in allDeps
      ? ["next.config.ts", "next.config.mjs", "next.config.js"]
      : ["vite.config.ts", "vite.config.js", "vite.config.mjs"];

  for (const file of configFiles) {
    if (existsSync(join(cwd, file))) return file;
  }
  return null;
}

export function isAlreadyConfigured(cwd: string, configFile: string): boolean {
  const content = readFileSync(join(cwd, configFile), "utf-8");
  return content.includes("next-yak");
}
