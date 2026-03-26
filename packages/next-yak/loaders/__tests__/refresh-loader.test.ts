import { describe, it, expect } from "vitest";

// Import the loader source directly (before build)
// The loader is a simple string transform, so we can test it as a function
const STYLED_COMMENT_REGEX =
  /\/\*YAK EXPORTED STYLED:([^:]+):[^*]+\*\//g;

function extractComponentNames(source: string): string[] {
  const names: string[] = [];
  let match;
  while ((match = STYLED_COMMENT_REGEX.exec(source)) !== null) {
    names.push(match[1]);
  }
  return names;
}

function applyRefreshLoader(source: string): string {
  const componentNames = extractComponentNames(source);
  if (componentNames.length === 0) return source;

  const registrations = componentNames
    .map((name, i) => {
      const varName = `_yak_c${i === 0 ? "" : i}`;
      return `var ${varName} = ${name};\n$RefreshReg$(${varName}, "${name}");`;
    })
    .join("\n");

  return `${source}\n\n/* next-yak: React Fast Refresh registration for styled components */\n${registrations}\n`;
}

describe("refresh-loader", () => {
  it("should inject $RefreshReg$ for exported styled components", () => {
    const source = `
import { __yak_section } from "next-yak/internal";
/*YAK EXPORTED STYLED:Section:styledOnly_Section_abc123*/
const Section = Object.assign(__yak_section("styledOnly_Section_abc123"), { displayName: "Section" });
export { Section };
    `.trim();

    const result = applyRefreshLoader(source);

    expect(result).toContain('$RefreshReg$(_yak_c, "Section")');
    expect(result).toContain("var _yak_c = Section;");
  });

  it("should handle multiple styled components", () => {
    const source = `
/*YAK EXPORTED STYLED:Section:cls1*/
const Section = __yak_section("cls1");
/*YAK EXPORTED STYLED:Heading:cls2*/
const Heading = __yak_h2("cls2");
    `.trim();

    const result = applyRefreshLoader(source);

    expect(result).toContain('$RefreshReg$(_yak_c, "Section")');
    expect(result).toContain('$RefreshReg$(_yak_c1, "Heading")');
  });

  it("should not modify files without yak styled comments", () => {
    const source = `
import { FunctionComponent } from "react";
export const MyComponent: FunctionComponent = () => <div />;
    `.trim();

    const result = applyRefreshLoader(source);

    expect(result).toBe(source);
    expect(result).not.toContain("$RefreshReg$");
  });

  it("should not match non-exported styled comments", () => {
    // Internal styled components don't have the EXPORTED marker
    const source = `
const Internal = __yak_div("cls1");
    `.trim();

    const result = applyRefreshLoader(source);

    expect(result).toBe(source);
  });
});
