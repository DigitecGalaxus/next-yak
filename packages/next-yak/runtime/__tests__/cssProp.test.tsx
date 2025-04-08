import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { css as internalCss } from "../cssLiteral";

const css = internalCss as (
  ...props: any
) => (props: Record<string, unknown>) => any;

type Theme = {
  mode: string;
  colors: {
    primary: string;
    secondary: string;
  };
};

describe("css function", () => {
  // Mock theme for testing
  const mockTheme = {
    mode: "light",
    colors: {
      primary: "blue",
      secondary: "red",
    },
  };

  describe("static css strings", () => {
    it("should handle static class names", () => {
      const cssFunction = css("static-class-name");
      const result = cssFunction({});

      expect(result).toEqual({
        className: "static-class-name",
        style: {},
      });
    });

    it("should combine multiple static class names", () => {
      const cssFunction = css("class1", "class2");
      const result = cssFunction({});

      expect(result).toEqual({
        className: "class1 class2",
        style: {},
      });
    });
  });

  describe("dynamic css functions", () => {
    it("should apply dynamic functions", () => {
      const dynamicFn = (props: { active: boolean }) =>
        props.active ? { className: "active" } : { className: "inactive" };

      const cssFunction = css(dynamicFn);

      const activeResult = cssFunction({ active: true });
      expect(activeResult.className).toBe("active");
      expect(activeResult.style).toEqual({});
      expect(activeResult).toHaveProperty("active", true);

      const inactiveResult = cssFunction({ active: false });
      expect(inactiveResult.className).toBe("inactive");
      expect(inactiveResult.style).toEqual({});
      expect(inactiveResult).toHaveProperty("active", false);
    });

    it("should handle nested dynamic functions", () => {
      const nestedFn = () => (innerProps: { level: number }) => {
        return { className: `level-${innerProps.level}` };
      };

      const cssFunction = css(nestedFn);
      const result = cssFunction({ level: 3 });

      expect(result.className).toBe("level-3");
      expect(result.style).toEqual({});
      expect(result).toHaveProperty("level", 3);
    });

    it("should combine static and dynamic class names", () => {
      const dynamicFn = (props: { active: boolean }) =>
        props.active ? { className: "active" } : { className: "inactive" };

      const cssFunction = css("base-class", dynamicFn);

      const result = cssFunction({ active: true });
      expect(result.className).toBe("base-class active");
      expect(result.style).toEqual({});
      expect(result).toHaveProperty("active", true);
    });
  });

  describe("style objects", () => {
    it("should handle static style objects", () => {
      const styleObj = { style: { "--color": "red" } };
      const cssFunction = css(styleObj);

      const result = cssFunction({});
      expect(result.style).toEqual({ "--color": "red" });
      expect(result.className).toBeUndefined();
    });

    it("should handle dynamic style properties", () => {
      const styleObj = {
        style: {
          "--color": (props: { color: string }) => props.color,
        },
      };

      const cssFunction = css(styleObj);

      const result = cssFunction({ color: "blue" });
      expect(result.style).toEqual({ "--color": "blue" });
      expect(result).toHaveProperty("color", "blue");
      expect(result.className).toBeUndefined();
    });

    it("should handle theme-dependent dynamic styles", () => {
      const styleObj = {
        style: {
          "--theme-color": (props: { theme: Theme }) =>
            props.theme.mode === "light"
              ? props.theme.colors.primary
              : props.theme.colors.secondary,
        },
      };

      const cssFunction = css(styleObj);

      const result = cssFunction({ theme: mockTheme });
      expect(result.style).toEqual({ "--theme-color": "blue" });
      expect(result).toHaveProperty("theme", mockTheme);
      expect(result.className).toBeUndefined();
    });
  });

  describe("complex combinations", () => {
    it("should handle complex combinations of static, dynamic, and style objects", () => {
      const staticClass = "static-class";
      const dynamicFn = (props: { active: boolean }) =>
        props.active ? { className: "active" } : { className: "inactive" };
      const styleObj = {
        style: {
          "--color": (props: { color: string; theme: Theme }) =>
            props.color || props.theme.colors.primary,
        },
      };

      const cssFunction = css(staticClass, dynamicFn, styleObj);

      const activeResult = cssFunction({
        active: true,
        color: "green",
        theme: mockTheme,
      });
      expect(activeResult.className).toBe("static-class active");
      expect(activeResult.style).toEqual({ "--color": "green" });
      expect(activeResult).toHaveProperty("active", true);
      expect(activeResult).toHaveProperty("color", "green");
      expect(activeResult).toHaveProperty("theme", mockTheme);

      const inactiveResult = cssFunction({ active: false, theme: mockTheme });
      expect(inactiveResult.className).toBe("static-class inactive");
      expect(inactiveResult.style).toEqual({ "--color": "blue" });
      expect(inactiveResult).toHaveProperty("active", false);
      expect(inactiveResult).toHaveProperty("theme", mockTheme);
    });

    it("should handle conditional dynamic styles", () => {
      const conditionalStyle = (props: { enabled: boolean; theme: Theme }) =>
        props.enabled
          ? css("enabled", { style: { "--color": props.theme.colors.primary } })
          : css("disabled", {
              style: { "--color": props.theme.colors.secondary },
            });

      const cssFunction = css("base", conditionalStyle);

      const enabledResult = cssFunction({ enabled: true, theme: mockTheme });
      expect(enabledResult.className).toBe("base enabled");
      expect(enabledResult.style).toEqual({ "--color": "blue" });
      expect(enabledResult).toHaveProperty("enabled", true);
      expect(enabledResult).toHaveProperty("theme", mockTheme);

      const disabledResult = cssFunction({ enabled: false, theme: mockTheme });
      expect(disabledResult.className).toBe("base disabled");
      expect(disabledResult.style).toEqual({ "--color": "red" });
      expect(disabledResult).toHaveProperty("enabled", false);
      expect(disabledResult).toHaveProperty("theme", mockTheme);
    });
  });

  describe("error handling", () => {
    const originalNodeEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = "development";
    });

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it("should throw an error in development mode for invalid dynamic style values", () => {
      const invalidStyleFn = () => ({ invalid: "object" });
      const styleObj = { style: { "--invalid": invalidStyleFn } };

      const cssFunction = css(styleObj);

      expect(() => cssFunction({})).toThrow();
    });

    it("should not throw in production mode for invalid dynamic style values", () => {
      process.env.NODE_ENV = "production";

      const invalidStyleFn = () => ({ invalid: "object" });
      const styleObj = { style: { "--invalid": invalidStyleFn } };

      const cssFunction = css(styleObj);

      expect(() => cssFunction({})).not.toThrow();
    });
  });
});

describe("class name merging through css function", () => {
  it("should handle class name merging with identical classes", () => {
    const cssFunction = css("base-class");
    const result = cssFunction({
      className: "base-class",
    });

    expect(result.className).toBe("base-class");
    expect(result.style).toEqual({});
  });

  it("should handle class name merging with subset classes", () => {
    const cssFunction = css("one two");
    const result = cssFunction({
      className: "one",
    });

    expect(result.className).toBe("one two");
    expect(result.style).toEqual({});
  });

  it("should append class names from different inputs", () => {
    const cssFunction = css("one two", () => ({ className: "three four" }));
    const result = cssFunction({
      className: "four two five",
    });

    expect(result.className).toBe("four two five one three");
    expect(result.style).toEqual({});
  });

  it("should handle empty and undefined class names", () => {
    const cssFunction = css("", () => ({ className: "valid-class" }));
    const result = cssFunction({ className: undefined });

    expect(result.className).toBe("valid-class");
    expect(result.style).toEqual({});
  });
});

describe("props combining through css function", () => {
  it("should merge styles from multiple sources", () => {
    const cssFunction = css({ style: { "--color": "red" } }, () => ({
      style: { "--background": "blue" },
    }));

    const result = cssFunction({ style: { "--border": "green" } });

    expect(result.style).toEqual({
      "--color": "red",
      "--background": "blue",
      "--border": "green",
    });
    expect(result.className).toBeUndefined();
  });

  it("should handle non-style props from the original props object", () => {
    const cssFunction = css((props: { original: string }) => ({
      className: props.original,
    }));

    const result = cssFunction({ original: "test-class" });

    expect(result.className).toBe("test-class");
    expect(result.style).toEqual({});
    expect(result).toHaveProperty("original", "test-class");
  });

  it("should handle empty or undefined styles", () => {
    const cssFunction = css(
      () => ({ style: undefined }),
      () => ({ style: { "--valid": "value" } }),
    );

    const result = cssFunction({ style: {} });

    expect(result.style).toEqual({
      "--valid": "value",
    });
    expect(result.className).toBeUndefined();
  });

  it("should handle combined class names and styles", () => {
    const cssFunction = css(
      "base-class",
      { style: { "--color": "red" } },
      (props: { active: boolean }) =>
        props.active
          ? { className: "active", style: { "--state": "active" } }
          : { className: "inactive", style: { "--state": "inactive" } },
    );

    const activeResult = cssFunction({ active: true, className: "test" });
    expect(activeResult.className).toBe("test base-class active");
    expect(activeResult.style).toEqual({
      "--color": "red",
      "--state": "active",
    });
    expect(activeResult).toHaveProperty("active", true);

    const inactiveResult = cssFunction({
      active: false,
      style: { color: "blue" },
    });
    expect(inactiveResult.className).toBe("base-class inactive");
    expect(inactiveResult.style).toEqual({
      "--color": "red",
      "--state": "inactive",
      color: "blue",
    });
    expect(inactiveResult).toHaveProperty("active", false);
  });
});
