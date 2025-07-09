// @ts-nocheck These are runtime tests and the external API isn't the runtime (after compile) API
import type { YakTheme } from "../context";
import { css } from "../cssLiteral";

describe("cssLiteral css function", () => {
  describe("static CSS class names", () => {
    it("should add static class name to classNames set", () => {
      const classNames = new Set<string>();
      const style: React.CSSProperties = {};
      const props = { theme: {} };

      const processor = css("static-class-name");
      processor(props, classNames, style);

      expect(classNames.has("static-class-name")).toBe(true);
    });

    it("should handle empty class name", () => {
      const classNames = new Set<string>();
      const style: React.CSSProperties = {};
      const props = { theme: {} };

      const processor = css("");
      processor(props, classNames, style);

      expect(classNames.size).toBe(0);
    });
  });

  describe("dynamic CSS functions", () => {
    it("should execute dynamic CSS functions", () => {
      const classNames = new Set<string>();
      const style: React.CSSProperties = {};
      const props = { theme: {} };

      const dynamicFn = (props, classNames, style) => {
        classNames.add("dynamic-class");
        style.color = "red";
      };

      const processor = css("base-class", dynamicFn);
      processor(props, classNames, style);

      expect(classNames.has("base-class")).toBe(true);
      expect(classNames.has("dynamic-class")).toBe(true);
      expect(style.color).toBe("red");
    });

    it("should handle multiple dynamic functions", () => {
      const classNames = new Set<string>();
      const style: React.CSSProperties = {};
      const props = { theme: {} };

      const fn1 = (props, classNames, style) => {
        classNames.add("class1");
        style.margin = "10px";
      };
      const fn2 = (props, classNames, style) => {
        classNames.add("class2");
        style.padding = "5px";
      };

      const processor = css("base", fn1, fn2);
      processor(props, classNames, style);

      expect(classNames.has("base")).toBe(true);
      expect(classNames.has("class1")).toBe(true);
      expect(classNames.has("class2")).toBe(true);
      expect(style.margin).toBe("10px");
      expect(style.padding).toBe("5px");
    });
  });

  describe("CSS variables with style objects", () => {
    it("should handle static CSS variables", () => {
      const classNames = new Set<string>();
      const style: React.CSSProperties = {};
      const props = { theme: {} };

      const styleObj = {
        style: {
          "--css-var": "static-value",
          "--another-var": "42px",
        },
      };

      const processor = css("class-name", styleObj);
      processor(props, classNames, style);

      expect(classNames.has("class-name")).toBe(true);
      expect(style["--css-var"]).toBe("static-value");
      expect(style["--another-var"]).toBe("42px");
    });

    it("should handle dynamic CSS variables with functions", () => {
      const classNames = new Set<string>();
      const style: React.CSSProperties = {};
      const props = {
        theme: {},
        $width: 100,
        $responsiveWidth: false,
      };

      const styleObj = {
        style: {
          "--width": (props) =>
            props.$responsiveWidth ? "100%" : `${props.$width}px`,
          "--static-var": "static-value",
        },
      };

      const processor = css("class-name", styleObj);
      processor(props, classNames, style);

      expect(classNames.has("class-name")).toBe(true);
      expect(style["--width"]).toBe("100px");
      expect(style["--static-var"]).toBe("static-value");
    });

    it("should handle mixed static and dynamic CSS variables (the bug fix)", () => {
      const classNames = new Set<string>();
      const style: React.CSSProperties = {};
      const props = {
        theme: {},
        $width: 200,
        $responsiveWidth: true,
        $aspectRatio: "16/9",
      };

      const styleObj = {
        style: {
          "--page_StyledImageWithRatioInternal__width_zWYXKE": (props) =>
            props.$responsiveWidth ? "100%" : `${props.$width}px`,
          "--page_StyledImageWithRatioInternal__aspect-ratio_zWYXKE": (props) =>
            props.$aspectRatio,
        },
      };

      const processor = css(
        "page_StyledImageWithRatioInternal_zWYXKE",
        styleObj,
      );
      processor(props, classNames, style);

      expect(classNames.has("page_StyledImageWithRatioInternal_zWYXKE")).toBe(
        true,
      );
      expect(style["--page_StyledImageWithRatioInternal__width_zWYXKE"]).toBe(
        "100%",
      );
      expect(
        style["--page_StyledImageWithRatioInternal__aspect-ratio_zWYXKE"],
      ).toBe("16/9");
    });

    it("should handle multiple style objects", () => {
      const classNames = new Set<string>();
      const style: React.CSSProperties = {};
      const props = {
        theme: {},
        $width: 150,
        $aspectRatio: "4/3",
      };

      const styleObj1 = {
        style: {
          "--var1": "value1",
          "--var2": (props) => (props.$width ? `${props.$width}px` : "0"),
        },
      };

      const styleObj2 = {
        style: {
          "--var3": "value3",
          "--var4": (props) => props.$aspectRatio || "auto",
        },
      };

      const processor = css("base-class", styleObj1, styleObj2);
      processor(props, classNames, style);

      expect(classNames.has("base-class")).toBe(true);
      expect(style["--var1"]).toBe("value1");
      expect(style["--var2"]).toBe("150px");
      expect(style["--var3"]).toBe("value3");
      expect(style["--var4"]).toBe("4/3");
    });
  });

  describe("complex combinations", () => {
    it("should handle mix of static class, dynamic functions, and CSS variables", () => {
      const classNames = new Set<string>();
      const style: React.CSSProperties = {};
      const props = {
        theme: {},
        $width: 300,
        $responsiveWidth: true,
      };

      const dynamicFn = (props, classNames, style) => {
        if (props.$responsiveWidth) {
          classNames.add("responsive");
        }
        style.display = "block";
      };

      const styleObj = {
        style: {
          "--width": (props) =>
            props.$responsiveWidth ? "100%" : `${props.$width}px`,
          "--static-height": "200px",
        },
      };

      const processor = css("base-class", dynamicFn, styleObj);
      processor(props, classNames, style);

      expect(classNames.has("base-class")).toBe(true);
      expect(classNames.has("responsive")).toBe(true);
      expect(style.display).toBe("block");
      expect(style["--width"]).toBe("100%");
      expect(style["--static-height"]).toBe("200px");
    });

    it("should handle empty inputs gracefully", () => {
      const classNames = new Set<string>();
      const style: React.CSSProperties = {};
      const props = { theme: {} };

      const processor = css();
      processor(props, classNames, style);

      expect(classNames.size).toBe(0);
      expect(Object.keys(style).length).toBe(0);
    });
  });

  describe("optimization for static-only CSS", () => {
    it("should optimize when no dynamic functions are present", () => {
      const classNames = new Set<string>();
      const style: React.CSSProperties = {};
      const props = { theme: {} };

      const processor = css("static-only-class");
      const result = processor(props, classNames, style);

      expect(classNames.has("static-only-class")).toBe(true);
      expect(typeof result).toBe("function"); // Should return the cleanup function
    });
  });

  describe("type conversion", () => {
    it("should convert non-string values to strings for CSS variables", () => {
      const classNames = new Set<string>();
      const style: React.CSSProperties = {};
      const props = {
        theme: {},
        $width: 42,
        $responsiveWidth: true,
      };

      const styleObj = {
        style: {
          "--number-var": (props) => props.$width || 0,
          "--boolean-var": (props) => props.$responsiveWidth || false,
        },
      };

      const processor = css("class", styleObj);
      processor(props, classNames, style);

      expect(style["--number-var"]).toBe("42");
      expect(style["--boolean-var"]).toBe("true");
    });

    it("should handle null and undefined values", () => {
      const classNames = new Set<string>();
      const style: React.CSSProperties = {};
      const props = { theme: {} };

      const styleObj = {
        style: {
          "--null-var": () => null,
          "--undefined-var": () => undefined,
          "--empty-var": () => "",
        },
      };

      const processor = css("class", styleObj);
      processor(props, classNames, style);

      expect(style["--null-var"]).toBe("null");
      expect(style["--undefined-var"]).toBe("undefined");
      expect(style["--empty-var"]).toBe("");
    });
  });

  describe("error conditions", () => {
    it("should handle invalid function types gracefully", () => {
      const classNames = new Set<string>();
      const style: React.CSSProperties = {};
      const props = { theme: {} };

      const invalidArg = { notAValidProperty: "value" };

      expect(() => {
        const processor = css("class", invalidArg);
        processor(props, classNames, style);
      }).not.toThrow();
    });

    it("should handle functions that throw errors", () => {
      const classNames = new Set<string>();
      const style: React.CSSProperties = {};
      const props = { theme: {} };

      const throwingFunction = () => {
        throw new Error("Test error");
      };

      expect(() => {
        const processor = css("class", throwingFunction);
        processor(props, classNames, style);
      }).toThrow("Test error");
    });
  });

  describe("real-world scenario from the bug report", () => {
    it("should handle the exact scenario from StyledImageWithRatioInternal", () => {
      const classNames = new Set<string>();
      const style: React.CSSProperties = {};
      const props = {
        theme: {},
        $responsiveWidth: false,
        $width: 250,
        $aspectRatio: "16/9",
      };

      // Simulate the exact compiled output from the bug report
      const dynamicWidthFn = (props, classNames, style) => {
        style["--page_StyledImageWithRatioInternal__width_zWYXKE"] =
          props.$responsiveWidth ? "100%" : `${props.$width}px`;
        classNames.add("page_StyledImageWithRatioInternal___zWYXKE");
      };

      const aspectRatioStyle = {
        style: {
          "--page_StyledImageWithRatioInternal__aspect-ratio_zWYXKE": (props) =>
            props.$aspectRatio,
        },
      };

      const processor = css(
        "page_StyledImageWithRatioInternal_zWYXKE",
        dynamicWidthFn,
        aspectRatioStyle,
      );

      processor(props, classNames, style);

      expect(classNames.has("page_StyledImageWithRatioInternal_zWYXKE")).toBe(
        true,
      );
      expect(classNames.has("page_StyledImageWithRatioInternal___zWYXKE")).toBe(
        true,
      );
      expect(style["--page_StyledImageWithRatioInternal__width_zWYXKE"]).toBe(
        "250px",
      );
      expect(
        style["--page_StyledImageWithRatioInternal__aspect-ratio_zWYXKE"],
      ).toBe("16/9");
    });

    it("should handle responsive width scenario", () => {
      const classNames = new Set<string>();
      const style: React.CSSProperties = {};
      const props = {
        theme: {},
        $responsiveWidth: true,
        $width: 250,
        $aspectRatio: "4/3",
      };

      const dynamicWidthFn = (props, classNames, style) => {
        style["--page_StyledImageWithRatioInternal__width_zWYXKE"] =
          props.$responsiveWidth ? "100%" : `${props.$width}px`;
        classNames.add("page_StyledImageWithRatioInternal___zWYXKE");
      };

      const aspectRatioStyle = {
        style: {
          "--page_StyledImageWithRatioInternal__aspect-ratio_zWYXKE": (props) =>
            props.$aspectRatio,
        },
      };

      const processor = css(
        "page_StyledImageWithRatioInternal_zWYXKE",
        dynamicWidthFn,
        aspectRatioStyle,
      );

      processor(props, classNames, style);

      expect(style["--page_StyledImageWithRatioInternal__width_zWYXKE"]).toBe(
        "100%",
      );
      expect(
        style["--page_StyledImageWithRatioInternal__aspect-ratio_zWYXKE"],
      ).toBe("4/3");
    });
  });

  describe("edge cases for CSS variable handling", () => {
    it("should handle mixed function and static values in same style object", () => {
      const classNames = new Set<string>();
      const style: React.CSSProperties = {};
      const props = {
        theme: {},
        $width: 123,
        $aspectRatio: "1/1",
      };

      const styleObj = {
        style: {
          "--dynamic": (props) => `${props.$width}px`,
          "--static": "static-value",
          "--another-dynamic": (props) => props.$aspectRatio,
          "--another-static": "100%",
        },
      };

      const processor = css("test-class", styleObj);
      processor(props, classNames, style);

      expect(style["--dynamic"]).toBe("123px");
      expect(style["--static"]).toBe("static-value");
      expect(style["--another-dynamic"]).toBe("1/1");
      expect(style["--another-static"]).toBe("100%");
    });

    it("should handle empty style objects", () => {
      const classNames = new Set<string>();
      const style: React.CSSProperties = {};
      const props = { theme: {} };

      const emptyStyleObj = { style: {} };

      const processor = css("test-class", emptyStyleObj);
      processor(props, classNames, style);

      expect(classNames.has("test-class")).toBe(true);
      expect(Object.keys(style).length).toBe(0);
    });

    it("should handle only static CSS variables", () => {
      const classNames = new Set<string>();
      const style: React.CSSProperties = {};
      const props = { theme: {} };

      const styleObj = {
        style: {
          "--static1": "value1",
          "--static2": "value2",
        },
      };

      const processor = css("test-class", styleObj);
      processor(props, classNames, style);

      expect(style["--static1"]).toBe("value1");
      expect(style["--static2"]).toBe("value2");
    });

    it("should handle only dynamic CSS variables", () => {
      const classNames = new Set<string>();
      const style: React.CSSProperties = {};
      const props = {
        theme: {},
        $value1: "dynamic1",
        $value2: "dynamic2",
      };

      const styleObj = {
        style: {
          "--dynamic1": (props) => props.$value1,
          "--dynamic2": (props) => props.$value2,
        },
      };

      const processor = css("test-class", styleObj);
      processor(props, classNames, style);

      expect(style["--dynamic1"]).toBe("dynamic1");
      expect(style["--dynamic2"]).toBe("dynamic2");
    });
  });
});
