import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { compile } from "./utils/testCompiler";
import path from "path";
import { getFixtures, getSnapshot } from "./utils/fixtures";
import { TestEnvironmentManager } from "./utils/TestEnvironmentManager";

beforeAll(async () => {
  await TestEnvironmentManager.removeAllFromDisk();
});

afterAll(async () => {
  await TestEnvironmentManager.removeAllFromDisk();
});

describe("Yak Webpack e2e fixture tests", async () => {
  const fixtures = (await getFixtures()).map((fixture) => [fixture.name, fixture] as const);

  test.each(fixtures)("should compile fixtures/%s", async (_, fixture) => {
    const inputObject = Object.fromEntries(
      fixture.files.map(file => ["./" + file.name, file.content])
    );

    const compiledCode = await compile(inputObject);

    for (const [filePath, content] of Object.entries(compiledCode)) {
      const outputFilePath = path.join(
        fixture.directory,
        'output',
        filePath
      );
      const fileContent = await getSnapshot(outputFilePath, content);
      // Compare compiled code with file content
      expect(content).toBe(fileContent);
    }
  });
});

describe("Yak Webpack e2e tests", () => {
  test("should compile constants from yak files", async () => {
    const compiledCode = await compile({
      "./src/index.tsx": `
      import { styled } from "next-yak";
      import { siteMaxWidth } from "./constants.yak";
      export const Button = styled.button\`
        color: red;
        height: \${siteMaxWidth}px;
      \`;
    `,
      "./src/constants.yak.ts": `
      export const siteMaxWidth = 10;
    `,
    });
    expect(JSON.stringify(compiledCode)).toContain("height: 10px;");
  });
});