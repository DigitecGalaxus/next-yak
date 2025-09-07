import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { bench, describe } from "vitest";
import { build, cleanBuild } from "./test-utils";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, "./fixtures");

describe("small project", () => {
  bench(
    "baseline",
    async () => {
      await build(join(FIXTURES_DIR, "small-project"));
    },
    {
      warmupTime: 0,
      warmupIterations: 0,
      iterations: 1,
      teardown: async () => {
        cleanBuild(join(FIXTURES_DIR, "small-project"));
      },
    },
  );
  bench(
    "with-yak",
    async () => {
      await build(join(FIXTURES_DIR, "small-project-with-yak"));
    },
    {
      warmupTime: 0,
      warmupIterations: 0,
      iterations: 1,
      teardown: async () => {
        cleanBuild(join(FIXTURES_DIR, "small-project-with-yak"));
      },
    },
  );
});

describe("medium project", () => {
  bench(
    "baseline",
    async () => {
      await build(join(FIXTURES_DIR, "medium-project"));
    },
    {
      warmupTime: 0,
      warmupIterations: 0,
      iterations: 1,
      teardown: async () => {
        cleanBuild(join(FIXTURES_DIR, "medium-project"));
      },
    },
  );
  bench(
    "with-yak",
    async () => {
      await build(join(FIXTURES_DIR, "medium-project-with-yak"));
    },
    {
      warmupTime: 0,
      warmupIterations: 0,
      iterations: 1,
      teardown: async () => {
        cleanBuild(join(FIXTURES_DIR, "medium-project-with-yak"));
      },
    },
  );
});
