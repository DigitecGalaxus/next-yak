// @ts-nocheck
// We are testing internal functionality which does not match
// 1:1 the API exposed to the user before compilation.
// Therefore types are not matching and need to be ignored.
import { expect, it, vi } from "vitest";
import { YakThemeProvider } from "../context/index.ts";
import { css } from "../cssLiteral.ts";
import { mergeCssProp } from "../internals/mergeCssProp.ts";
import { styled as styledFn } from "../styled.ts";
import { renderInto } from "./testUtils.tsx";

// This transform is usually done by the SWC plugin.
// However this `styled.test.tsx` does not compile
// the code before testing
const styled = Object.assign(styledFn, {
  div: styledFn("div"),
  input: styledFn("input"),
  button: styledFn("button"),
}) as typeof styledFn;

it("should render a literal element", () => {
  const Component = styled.input``;
  const container = renderInto(() => <Component />);
  expect(container.innerHTML).toBe("<input>");
});

it("should render a literal element with styles", () => {
  const Component = styled.input("cssClass");
  const container = renderInto(() => <Component />);
  expect(container.querySelector("input")?.className).toBe("cssClass");
});

it("should forward properties", () => {
  const Component = styled.input("cssClass");
  const container = renderInto(() => <Component type="text" />);
  const input = container.querySelector("input")!;
  expect(input.className).toBe("cssClass");
  expect(input.getAttribute("type")).toBe("text");
});

it("should forward children", () => {
  const Component = styled.div``;
  const container = renderInto(() => (
    <Component>
      <button>Click me!</button>
    </Component>
  ));
  expect(container.innerHTML).toBe("<div><button>Click me!</button></div>");
});

it("should filter out properties starting with $", () => {
  const Component = styled.input``;
  const container = renderInto(() => <Component $forwardedProp="notForwarded" />);
  const input = container.querySelector("input")!;
  expect(input.getAttributeNames()).toEqual([]);
});

it("should filter out properties starting with $ when passing to custom components", () => {
  let forwardedKeys: string[] | null = null;
  const Custom = (props) => {
    forwardedKeys = Object.keys(props).filter((key) => props[key] !== undefined);
    return null;
  };
  const StyledCustom = styled(Custom)``;
  renderInto(() => <StyledCustom $forwardedProp="notForwarded" />);
  expect(forwardedKeys).not.toContain("$forwardedProp");
  expect(forwardedKeys).not.toContain("theme");
});

it("should pass the generated class to custom components", () => {
  let receivedClass: string | undefined;
  const Custom = (props) => {
    receivedClass = props.class;
    return null;
  };
  const StyledCustom = styled(Custom)("customClass");
  renderInto(() => <StyledCustom />);
  expect(receivedClass).toBe("customClass");
});

it("should merge the class names of a styled(styled()) chain in order", () => {
  const Inner = styled.input("innerClass");
  const Outer = styled(Inner)("outerClass");
  const container = renderInto(() => <Outer />);
  expect(container.querySelector("input")?.className).toBe("innerClass outerClass");
});

it("should render a styled(styled()) chain as a single element", () => {
  const Inner = styled.div("innerClass");
  const Outer = styled(Inner)("outerClass");
  const container = renderInto(() => <Outer />);
  expect(container.querySelectorAll("div").length).toBe(1);
});

it("should execute each dynamic style function exactly once per render", () => {
  const innerFn = vi.fn(() => css("innerDynamic"));
  const Inner = styled.input("innerClass", innerFn);
  const Outer = styled(Inner)("outerClass");
  const container = renderInto(() => <Outer />);
  expect(innerFn).toHaveBeenCalledTimes(1);
  expect(container.querySelector("input")?.className).toBe("innerClass innerDynamic outerClass");
});

it("should support attrs objects", () => {
  const Component = styled.button.attrs({ type: "button" })("cssClass");
  const container = renderInto(() => <Component />);
  const button = container.querySelector("button")!;
  expect(button.getAttribute("type")).toBe("button");
  expect(button.className).toBe("cssClass");
});

it("should support attrs functions receiving props", () => {
  const Component = styled.input.attrs((props) => ({
    "aria-label": props.$text,
  }))``;
  const container = renderInto(() => <Component $text="hello world" />);
  const input = container.querySelector("input")!;
  expect(input.getAttribute("aria-label")).toBe("hello world");
  expect(input.getAttribute("$text")).toBe(null);
});

it("should preserve attrs order across styled() levels", () => {
  const SubmitButton = styled.button.attrs({ type: "submit" })("submit_btn");
  const ResetButton = styled(SubmitButton).attrs({ type: "reset" })("reset_btn");
  const container = renderInto(() => <ResetButton />);
  const button = container.querySelector("button")!;
  expect(button.getAttribute("type")).toBe("reset");
  expect(button.className).toBe("submit_btn reset_btn");
});

it("should run parent attrs functions before own attrs functions", () => {
  const order: string[] = [];
  const Parent = styled.input.attrs(() => {
    order.push("parent");
    return { "aria-label": "parent" };
  })``;
  const Child = styled(Parent).attrs(() => {
    order.push("child");
    return {};
  })``;
  renderInto(() => <Child />);
  expect(order).toEqual(["parent", "child"]);
  expect(order.filter((entry) => entry === "parent").length).toBe(1);
});

it("should merge a user provided class", () => {
  const Component = styled.input("cssClass");
  const container = renderInto(() => <Component class="userClass" />);
  expect(container.querySelector("input")?.className).toBe("userClass cssClass");
});

it("should merge a user provided style with dynamic styles", () => {
  const Component = styled.input("cssClass", {
    style: { "--x": () => "10px" },
  });
  const container = renderInto(() => <Component style={{ padding: "5px" }} />);
  const input = container.querySelector("input")!;
  expect(input.style.getPropertyValue("--x")).toBe("10px");
  expect(input.style.padding).toBe("5px");
});

it("should set css variables from dynamic props", () => {
  const Component = styled.input("cssClass", {
    style: { "--width": (props) => `${props.$width * 2}px` },
  });
  const container = renderInto(() => <Component $width={10} />);
  expect(container.querySelector("input")?.style.getPropertyValue("--width")).toBe("20px");
});

it("should support conditional dynamic class functions", () => {
  const Component = styled.input("base", (props) => props.$active && css("active"));
  const active = renderInto(() => <Component $active />);
  const inactive = renderInto(() => <Component />);
  expect(active.querySelector("input")?.className).toBe("base active");
  expect(inactive.querySelector("input")?.className).toBe("base");
});

it("should provide the theme to dynamic style functions", () => {
  const Component = styled.input("base", {
    style: { "--color": (props) => props.theme.color },
  });
  const container = renderInto(() => (
    <YakThemeProvider theme={{ color: "red" }}>
      <Component />
    </YakThemeProvider>
  ));
  expect(container.querySelector("input")?.style.getPropertyValue("--color")).toBe("red");
});

it("should provide the theme to attrs functions", () => {
  const Component = styled.input.attrs((props) => ({
    "aria-label": props.theme.label,
  }))``;
  const container = renderInto(() => (
    <YakThemeProvider theme={{ label: "themed" }}>
      <Component />
    </YakThemeProvider>
  ));
  expect(container.querySelector("input")?.getAttribute("aria-label")).toBe("themed");
});

it("should merge the css prop with class and style (mergeCssProp)", () => {
  const result = mergeCssProp(
    { class: "test-class", style: { padding: "5px" } },
    css("cssPropClass"),
  );
  expect(result).toEqual({
    class: "test-class cssPropClass",
    style: { padding: "5px" },
  });
});

it("should not emit an empty style object from mergeCssProp", () => {
  const result = mergeCssProp({}, css("onlyClass"));
  expect(result).toEqual({ class: "onlyClass" });
});
