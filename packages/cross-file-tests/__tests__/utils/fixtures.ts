import fs from "fs/promises";
import fastGlob from "fast-glob";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export const getFixtures = async (): Promise<
  {
    name: string;
    directory: string;
    files: {
      name: string;
      content: string;
    }[];
  }[]
> => {
  const fixturePattern = "fixtures/*/index.tsx";
  const fixtureEntries = await fastGlob(fixturePattern, {
    cwd: path.resolve(__dirname, ".."),
    absolute: true,
  });
  return Promise.all(
    fixtureEntries.map(async (entry) => ({
      name: path.basename(path.dirname(entry)),
      directory: path.dirname(entry),
      // all tsx files except the entry file and ./output/*
      files: await fastGlob(["**/*.(ts|tsx)", "!output/**"], {
        cwd: path.dirname(entry),
        absolute: true,
      }).then((files) =>
        Promise.all(
          files.map(async (file) => ({
            name: "./fixture/" + path.basename(path.dirname(entry)) + "/" + path.relative(path.dirname(entry), file).replace(/\\/g, "/"),
            content: await fs.readFile(file, "utf-8"),
          }))
        )
      ),
    }))
  );
};

export const getSnapshot = async (
  filePath: string,
  content: string
): Promise<string> => {
  // hack around index.tsx?./index.yak.module.ts
  filePath = filePath
    .replace(/(^|[\\\/])[^\\\/\?]*\?\.\//, "$1")
    // remove output/fixture/folder from path
    .replace(/output[\\\/]fixture[\\\/][^\\\/]*[\\\/]/, "output/");
  const fileDir = path.dirname(filePath);
  await fs.mkdir(fileDir, { recursive: true });

  const snapshot = await readFile(filePath);
  if (snapshot === null || process.env.UPDATE) {
    await fs.writeFile(filePath, content);
    return content;
  }
  return snapshot;
};

const readFile = async (filePath: string): Promise<string | null> => {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (error) {
    if (error.code === "ENOENT") {
      return null
    }
    throw error;
  }
};