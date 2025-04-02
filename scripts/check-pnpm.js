#!/usr/bin/env node

// Check if the user is using pnpm (as it's the only supported package manager for this project)
const userAgent = process.env.npm_config_user_agent;
if (!userAgent?.startsWith("pnpm")) {
  console.error("Please use pnpm for publishing");
  process.exit(1);
}
