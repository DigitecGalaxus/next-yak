import DynamicEditor from "@/components/editor";
import { decompressWithDictionary } from "@/components/compress";
import { examples } from "./examples";
import { readFile, access } from "node:fs/promises";
import path from "node:path";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

type VersionEntry = { version: string; label: string };

export default async function Home(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;

  let initialState: Record<string, string> = examples.base.files;
  if (
    searchParams["q"] &&
    typeof searchParams["q"] === "string" &&
    searchParams["q"].length > 0
  ) {
    initialState = decompressWithDictionary(searchParams["q"]);
  }

  const currentVersion = await getReleasedVersion();
  const versions = await getAvailableVersions(currentVersion);
  const defaultVersion =
    typeof searchParams["v"] === "string"
      ? searchParams["v"]
      : currentVersion;

  return (
    <DynamicEditor
      initialState={initialState}
      versions={versions}
      defaultVersion={defaultVersion}
    />
  );
}

const getReleasedVersion = async () => {
  const root = await findFileUp("pnpm-lock.yaml", process.cwd());
  const packageJson = await readFile(
    path.join(root, "packages", "next-yak", "package.json"),
    "utf-8",
  );
  return JSON.parse(packageJson).version as string;
};

async function getAvailableVersions(
  currentVersion: string,
): Promise<VersionEntry[]> {
  try {
    const root = await findFileUp("pnpm-lock.yaml", process.cwd());
    const manifestPath = path.join(root, "docs", "public", "wasm", "versions.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf-8"));
    return manifest as VersionEntry[];
  } catch {
    return [{ version: currentVersion, label: `v${currentVersion} (current)` }];
  }
}

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
