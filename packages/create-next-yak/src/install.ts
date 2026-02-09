import { execSync } from "node:child_process";
import type { PackageManager } from "./detect.ts";

const installCommands: Record<PackageManager, string> = {
  pnpm: "pnpm add next-yak",
  npm: "npm install next-yak",
  yarn: "yarn add next-yak",
  bun: "bun add next-yak",
};

export function installNextYak(
  packageManager: PackageManager,
  cwd: string
): void {
  const command = installCommands[packageManager];
  execSync(command, { cwd, stdio: "inherit" });
}
