#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { styleText } from "node:util";
import { detectProject, isAlreadyConfigured } from "./detect.ts";
import { installNextYak } from "./install.ts";
import {
  transformNextConfig,
  getDefaultNextConfig,
} from "./transform-next.ts";
import {
  transformViteConfig,
  getDefaultViteConfig,
} from "./transform-vite.ts";

const cwd = process.cwd();

try {
  console.log();
  console.log(styleText("bold", "🦬 Setting up next-yak..."));
  console.log();

  const project = detectProject(cwd);

  console.log(
    `  Project type:    ${styleText("cyan", project.type === "next" ? "Next.js" : "Vite")}`
  );
  console.log(
    `  Package manager: ${styleText("cyan", project.packageManager)}`
  );
  console.log(
    `  Config file:     ${styleText("cyan", project.configFile ?? "(will be created)")}`
  );
  console.log();

  // Check if already configured
  if (project.configFile && isAlreadyConfigured(cwd, project.configFile)) {
    console.log(
      styleText("yellow", "  next-yak is already configured. Nothing to do!")
    );
    console.log();
    process.exit(0);
  }

  // Install next-yak
  console.log(styleText("dim", `  Installing next-yak...`));
  console.log();
  installNextYak(project.packageManager, cwd);
  console.log();

  // Transform or create config file
  if (project.configFile) {
    const configPath = join(cwd, project.configFile);
    const original = readFileSync(configPath, "utf-8");
    const transformed =
      project.type === "next"
        ? transformNextConfig(original)
        : transformViteConfig(original);
    writeFileSync(configPath, transformed);
    console.log(
      `  ${styleText("green", "✓")} Updated ${styleText("bold", project.configFile)}`
    );
  } else {
    const defaultFile =
      project.type === "next" ? "next.config.mjs" : "vite.config.ts";
    const defaultConfig =
      project.type === "next" ? getDefaultNextConfig() : getDefaultViteConfig();
    writeFileSync(join(cwd, defaultFile), defaultConfig);
    console.log(
      `  ${styleText("green", "✓")} Created ${styleText("bold", defaultFile)}`
    );
  }

  console.log();
  console.log(styleText("green", "  next-yak is ready to use!"));
  console.log();
  console.log(
    styleText("dim", "  Documentation: https://yak.js.org/getting-started")
  );
  console.log();
} catch (error: unknown) {
  console.error();
  console.error(
    styleText("red", `  Error: ${error instanceof Error ? error.message : String(error)}`)
  );
  console.error();
  process.exit(1);
}
