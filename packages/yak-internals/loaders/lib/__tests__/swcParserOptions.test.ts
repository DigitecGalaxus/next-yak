import { transform } from "@swc/core";
import { describe, expect, it } from "vitest";
import { getSwcParserOptions } from "../swcParserOptions.js";

describe("swc parses every extension of the yak loader rule", () => {
  const jsxSource = `import { styled } from "next-yak";
const Container = styled.div\`display: flex;\`;
export default function Component() {
  return <Container>Hello</Container>;
}`;
  const typeScriptSource = `import { styled } from "next-yak";
export const gap: Array<number> = [1];
export const Container = styled.div\`gap: \${gap[0]}px;\`;`;

  it.each(
    Object.entries({
      "a.js": jsxSource,
      "a.jsx": jsxSource,
      "a.mjs": jsxSource,
      "a.cjs": jsxSource,
      "a.tsx": typeScriptSource + jsxSource.replace(/^import .*\n/, ""),
      "a.ts": typeScriptSource,
      "a.mts": typeScriptSource,
      "a.cts": typeScriptSource,
    }),
  )("parses %s", async (file, code) => {
    const filename = `/app/${file}`;
    const result = await transform(code, {
      filename,
      jsc: {
        parser: getSwcParserOptions(filename),
        target: "es2022",
        transform: { react: { runtime: "preserve" } },
      },
      isModule: true,
    });
    expect(result.code).toContain("styled.div");
  });

  it("keeps import attributes", async () => {
    const source = `import data from "./data.json" with { type: "json" };\nexport default data;`;
    const result = await transform(source, {
      filename: "/app/a.ts",
      jsc: {
        parser: getSwcParserOptions("/app/a.ts"),
        target: "es2022",
        experimental: { keepImportAttributes: true },
      },
      isModule: true,
    });
    expect(result.code).toContain(`type: "json"`);
  });
});
