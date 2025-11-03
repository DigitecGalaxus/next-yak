import { LandingPage } from "@/components/landingPage";
import { Metadata } from "next";
import { readFile, access } from "node:fs/promises";
import path from "node:path";

export const metadata: Metadata = {
  title: "Zero-runtime CSS-in-JS powered by Rust",
  description:
    "🦀 Zero-runtime CSS-in-JS powered by Rust. Write styled-components syntax, get build-time CSS extraction and full RSC compatibility.",
};

export default async function HomePage() {
  const version = await getReleasedVersion();
  return <LandingPage version={version} />;
}

const getReleasedVersion = async () => {
  const root = await findFileUp("pnpm-lock.yaml", process.cwd());
  const packageJson = await readFile(
    path.join(root, "packages", "next-yak", "package.json"),
    "utf-8",
  );
  return JSON.parse(packageJson).version;
};

async function findFileUp(filename: string, startDir: string) {
  const filePath = path.resolve(startDir, filename);
  try {
    await access(filePath);
    return startDir;
  } catch (err) {
    const parentDir = path.dirname(startDir);
    if (parentDir === startDir)
      throw new Error(`${filename} not found in directory tree`);

    return findFileUp(filename, parentDir);
  }
}
