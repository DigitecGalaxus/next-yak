import { describe, expect, it } from "vitest";
import { replaceDataUrlImport } from "../replaceDataUrlImport.js";

const decode = (code: string) => {
  const line = code.split("\n").find((line) => line.includes("data:text/css;base64,"))!;
  const base64 = line.slice('import "data:text/css;base64,'.length, -2);
  return Buffer.from(base64, "base64").toString("utf8");
};

describe("replaceDataUrlImport", () => {
  it("leaves a module without extracted css untouched", () => {
    const code = [
      '"use client";',
      'import { YakThemeProvider } from "next-yak/internal";',
      'if (typeof document !== "undefined") {',
      '    console.log("client only");',
      "}",
    ].join("\n");

    expect(replaceDataUrlImport(code, "")).toBe(code);
  });

  it("swaps the data-url line and keeps the rest of the module", () => {
    const code = [
      'import { styled } from "next-yak/internal";',
      'import "data:text/css;base64,Lm9sZHt9";',
      "const Button = __yak.__yak_button();",
    ].join("\n");

    const result = replaceDataUrlImport(code, ".input_Button_m7uBBu { color: red; }");
    const lines = result.split("\n");

    expect(lines[0]).toBe('import { styled } from "next-yak/internal";');
    expect(lines[2]).toBe("const Button = __yak.__yak_button();");
    expect(lines[1].endsWith('";')).toBe(true);
    expect(decode(result)).toBe(".input_Button_m7uBBu { color: red; }");
  });

  it("ignores source code which merely mentions a data url", () => {
    const code = [
      'const doc = "import \\"data:text/css;base64,\\"";',
      'import "data:text/css;base64,Lm9sZHt9";',
    ].join("\n");

    const lines = replaceDataUrlImport(code, ".a{}").split("\n");

    expect(lines[0]).toBe('const doc = "import \\"data:text/css;base64,\\"";');
    expect(lines[1]).toBe(
      `import "data:text/css;base64,${Buffer.from(".a{}").toString("base64")}";`,
    );
  });
});
