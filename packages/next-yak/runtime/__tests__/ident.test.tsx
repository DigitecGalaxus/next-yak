import { ident } from "../ident";

describe("ident function", () => {
  describe("dashed-ident (CSS custom property)", () => {
    it("should return raw identifier via .name property", () => {
      const thumbSize = ident("--my-thumb-size");
      expect(thumbSize.name).toBe("--my-thumb-size");
    });

    it("should return var() wrapper when coerced to string", () => {
      const thumbSize = ident("--my-thumb-size");
      expect(thumbSize.toString()).toBe("var(--my-thumb-size)");
      expect(String(thumbSize)).toBe("var(--my-thumb-size)");
    });

    it("should work in template literals via Symbol.toPrimitive", () => {
      const thumbSize = ident("--my-thumb-size");
      expect(`width: ${thumbSize}`).toBe("width: var(--my-thumb-size)");
    });
  });

  describe("custom-ident (non-dashed)", () => {
    it("should return raw identifier via .name property", () => {
      const trackArea = ident("my-track-area");
      expect(trackArea.name).toBe("my-track-area");
    });

    it("should return raw identifier when coerced to string", () => {
      const trackArea = ident("my-track-area");
      expect(trackArea.toString()).toBe("my-track-area");
      expect(String(trackArea)).toBe("my-track-area");
    });

    it("should work in template literals via Symbol.toPrimitive", () => {
      const trackArea = ident("my-track-area");
      expect(`grid-area: ${trackArea}`).toBe("grid-area: my-track-area");
    });
  });

  describe("edge cases", () => {
    it("should handle idents that start with --", () => {
      const customProp = ident("--");
      expect(customProp.name).toBe("--");
      expect(customProp.toString()).toBe("var(--)");
    });

    it("should handle empty string", () => {
      const empty = ident("");
      expect(empty.name).toBe("");
      expect(empty.toString()).toBe("");
    });
  });
});
