// @ts-nocheck
// We are testing internal functionality which does not match
// 1:1 the API exposed to the user before compilation.
// Therefore types are not matching and need to be ignored.
import { createSignal, flush } from "solid-js";
import { expect, it, vi } from "vitest";
import { YakThemeProvider } from "../context/index.ts";
import { css } from "../cssLiteral.ts";
import { styled as styledFn } from "../styled.ts";
import { renderInto } from "./testUtils.tsx";

const styled = Object.assign(styledFn, {
  div: styledFn("div"),
  input: styledFn("input"),
}) as typeof styledFn;

it("should update css variables when a signal-driven prop changes without re-creating the element", () => {
  const Component = styled.div("box", {
    style: { "--rotation": (props) => `${props.$rotation}deg` },
  });
  const [rotation, setRotation] = createSignal(0);
  const container = renderInto(() => <Component $rotation={rotation()} />);

  const element = container.querySelector("div")!;
  expect(element.style.getPropertyValue("--rotation")).toBe("0deg");

  setRotation(90);
  flush();

  expect(element.style.getPropertyValue("--rotation")).toBe("90deg");
  // identity-stable: the DOM element was updated, not replaced
  expect(container.querySelector("div")).toBe(element);
});

it("should toggle conditional classes when a signal-driven prop changes", () => {
  const Component = styled.input("base", (props) => props.$active && css("active"));
  const [active, setActive] = createSignal(false);
  const container = renderInto(() => <Component $active={active()} />);

  const element = container.querySelector("input")!;
  expect(element.className).toBe("base");

  setActive(true);
  flush();
  expect(element.className).toBe("base active");
  expect(container.querySelector("input")).toBe(element);

  setActive(false);
  flush();
  expect(element.className).toBe("base");
});

it("should only re-run the style memo for props used by the css", () => {
  const styleFn = vi.fn((props) => `${props.$used}px`);
  const Component = styled.div("box", { style: { "--used": styleFn } });
  const [used, setUsed] = createSignal(1);
  const [unused, setUnused] = createSignal(1);
  renderInto(() => <Component $used={used()} data-unused={unused()} />);

  const callsAfterMount = styleFn.mock.calls.length;

  setUnused(2);
  flush();
  expect(styleFn.mock.calls.length).toBe(callsAfterMount);

  setUsed(2);
  flush();
  expect(styleFn.mock.calls.length).toBeGreaterThan(callsAfterMount);
});

it("should update styles when the theme changes", () => {
  const Component = styled.div("box", {
    style: { "--color": (props) => props.theme.color },
  });
  const [theme, setTheme] = createSignal({ color: "red" });
  const container = renderInto(() => (
    <YakThemeProvider theme={theme()}>
      <Component />
    </YakThemeProvider>
  ));

  const element = container.querySelector("div")!;
  expect(element.style.getPropertyValue("--color")).toBe("red");

  setTheme({ color: "blue" });
  flush();
  expect(element.style.getPropertyValue("--color")).toBe("blue");
  expect(container.querySelector("div")).toBe(element);
});

it("should keep a static component identity-stable when the theme changes", () => {
  const Static = styled.div("staticClass");
  const [theme, setTheme] = createSignal({ color: "red" });
  const container = renderInto(() => (
    <YakThemeProvider theme={theme()}>
      <Static />
    </YakThemeProvider>
  ));

  const element = container.querySelector("div")!;
  expect(element.className).toBe("staticClass");

  setTheme({ color: "blue" });
  flush();
  expect(container.querySelector("div")).toBe(element);
  expect(element.className).toBe("staticClass");
});

it("should update attrs-driven attributes reactively", () => {
  const Component = styled.input.attrs((props) => ({
    "aria-label": props.$label,
  }))``;
  const [label, setLabel] = createSignal("first");
  const container = renderInto(() => <Component $label={label()} />);

  const element = container.querySelector("input")!;
  expect(element.getAttribute("aria-label")).toBe("first");

  setLabel("second");
  flush();
  expect(element.getAttribute("aria-label")).toBe("second");
});

it("should react to incoming class changes on static components", () => {
  const Component = styled.input("cssClass");
  const [extra, setExtra] = createSignal("a");
  const container = renderInto(() => <Component class={extra()} />);

  const element = container.querySelector("input")!;
  expect(element.className).toBe("a cssClass");

  setExtra("b");
  flush();
  expect(element.className).toBe("b cssClass");
});
