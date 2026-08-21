import type { ESTree } from "@oxlint/plugins";
import { describe, expect, it } from "vitest";
import { isStyledOrCssTag } from "./utils.js";

function taggedIdentifier(name: string): ESTree.Node {
  return {
    type: "TaggedTemplateExpression",
    tag: {
      type: "Identifier",
      name,
    },
  } as unknown as ESTree.Node;
}

describe("isStyledOrCssTag", () => {
  it("distinguishes direct styled and css tags", () => {
    const importedNames = { styled: "styled", css: "css" };

    expect(isStyledOrCssTag(taggedIdentifier("styled"), importedNames)).toBe("styled");
    expect(isStyledOrCssTag(taggedIdentifier("css"), importedNames)).toBe("css");
  });
});
