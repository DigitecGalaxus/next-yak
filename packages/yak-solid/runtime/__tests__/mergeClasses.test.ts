import { describe, expect, it } from "vitest";
import { mergeClasses } from "../internals/mergeClasses.js";

describe("mergeClasses", () => {
  it("merges the yak class with a user string", () => {
    expect(mergeClasses("yX", "user")).toBe("yX user");
  });

  it("returns the yak class when the user value is falsy", () => {
    expect(mergeClasses("yX", undefined)).toBe("yX");
    expect(mergeClasses("yX", false)).toBe("yX");
    expect(mergeClasses("yX", "")).toBe("yX");
  });

  it("normalizes Solid array class values", () => {
    expect(mergeClasses("yX", ["a", false && "b", "c"])).toBe("yX a c");
  });

  it("normalizes Solid object class values", () => {
    expect(mergeClasses("yX", { on: true, off: false })).toBe("yX on");
  });
});
