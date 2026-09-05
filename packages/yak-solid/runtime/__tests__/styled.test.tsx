// @ts-nocheck
// We are testing internal functionality which does not match
// 1:1 the API exposed to the user before compilation.
// Therefore types are not matching and need to be ignored.
import { expect, it, vi } from "vitest";
import { createSignal, flush } from "solid-js";
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

it("should flatten chains through a get-only proxy (solid-refresh dev wrapper)", () => {
  const SubmitButton = styled.button.attrs({ type: "submit" })("submit_btn");
  // solid-refresh registers components behind a Proxy that forwards property
  // reads but defines no `has` trap — chain detection must still see the
  // yak component behind it
  const Registered = new Proxy(function HMRComp() {}, {
    get: (_, property) => (SubmitButton as never as Record<PropertyKey, unknown>)[property],
  });
  const ResetButton = styled(Registered as typeof SubmitButton).attrs({ type: "reset" })(
    "reset_btn",
  );
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
    style: { "--color": (props) => props.theme().color },
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
    "aria-label": props.theme().label,
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

it("should forward unrelated props through mergeCssProp", () => {
  // the compiled output spreads only mergeCssProp's result onto the element,
  // so onClick, data-*, children etc. must survive the merge
  const onClick = () => {};
  const result = mergeCssProp(
    { "data-testid": "button", onClick, children: "label", class: "user" },
    css("cssPropClass"),
  );
  expect(result).toEqual({
    "data-testid": "button",
    onClick,
    children: "label",
    class: "user cssPropClass",
  });
});

it("should apply no styles for a falsy css prop", () => {
  // e.g. `css={on && css`...`}` with `on` being false
  const result = mergeCssProp({ class: "user" }, false);
  expect(result).toEqual({ class: "user" });
});

it("should forward a `component` prop to wrapped components", () => {
  // polymorphic targets (e.g. router links) accept a `component` prop -
  // it must reach them instead of being consumed by the render mechanism
  const Polymorphic = (props: any) => (
    <a data-received={props.component} class={props.class}>
      {props.children}
    </a>
  );
  const Styled = styledFn(Polymorphic)("styledClass");
  const container = renderInto(() => <Styled component="button">link</Styled>);
  const anchor = container.querySelector("a");
  expect(anchor?.getAttribute("data-received")).toBe("button");
  expect(anchor?.className).toContain("styledClass");
});

// --- props assembly -----------------------------------------------------------
// A single Proxy assembles the props a styled element hands to its target. These
// tests pin what it has to guarantee: which props are visible, in which order,
// and which source wins when two of them set the same key.

it("should enumerate props in source order with contributed values last", () => {
  const Component = styled.input("cssClass");
  const seen: string[] = [];
  const Probe = (props: Record<string, unknown>) => {
    seen.push(...Object.keys(props));
    return <input />;
  };
  const Wrapped = styledFn(Probe)("wrapped");
  renderInto(() => <Wrapped id="a" name="b" $hidden />);
  expect(seen).toEqual(["id", "name", "class"]);
  // and the same set is what actually reaches a real element
  const container = renderInto(() => <Component id="a" name="b" $hidden />);
  expect(container.innerHTML).toBe('<input id="a" name="b" class="cssClass">');
});

it("should hide $ props from `in` checks and from enumeration", () => {
  const probe: Record<string, unknown> = {};
  const Probe = (props: Record<string, unknown>) => {
    probe.hasHidden = "$hidden" in props;
    probe.hasId = "id" in props;
    probe.keys = Object.keys(props);
    probe.hiddenValue = props.$hidden;
    return <input />;
  };
  const Wrapped = styledFn(Probe)("wrapped");
  renderInto(() => <Wrapped id="a" $hidden="x" />);
  expect(probe.hasHidden).toBe(false);
  expect(probe.hasId).toBe(true);
  expect(probe.keys).toEqual(["id", "class"]);
  expect(probe.hiddenValue).toBeUndefined();
});

it("should not leak a user `component` prop onto a tag target", () => {
  const Component = styled.input("cssClass");
  const container = renderInto(() => <Component component="span" id="a" />);
  expect(container.innerHTML).toBe('<input id="a" class="cssClass">');
});

it("should pass a user `component` prop to a custom component target", () => {
  const seen: Record<string, unknown> = {};
  const Probe = (props: Record<string, unknown>) => {
    seen.component = props.component;
    return <input />;
  };
  const Wrapped = styledFn(Probe)("wrapped");
  renderInto(() => <Wrapped component="span" />);
  expect(seen.component).toBe("span");
});

it("should let attrs override author props and contributed class win over both", () => {
  const Component = styledFn("input").attrs({ id: "from-attrs", class: "from-attrs" })("cssClass");
  const container = renderInto(() => <Component id="from-author" />);
  const input = container.querySelector("input")!;
  expect(input.getAttribute("id")).toBe("from-attrs");
  expect(input.className).toBe("from-attrs cssClass");
});

it("should keep the class binding reactive when a $ prop changes", () => {
  const [ghost, setGhost] = createSignal(false);
  const Component = styled.button("base", (props) => props.$ghost && css("ghost"));
  const container = renderInto(() => <Component $ghost={ghost()} />);
  const button = container.querySelector("button")!;
  expect(button.className).toBe("base");
  setGhost(true);
  flush();
  expect(button.className).toBe("base ghost");
  expect(button.hasAttribute("$ghost")).toBe(false);
});

it("should not answer inherited Object.prototype members from the props proxy", () => {
  const probe: Record<string, unknown> = {};
  const Probe = (props: Record<string, unknown>) => {
    probe.hasOwn = props.hasOwnProperty("id");
    probe.coerced = String(props);
    probe.toStringIsFn = typeof props.toString === "function";
    probe.constructorIsFn = typeof props.constructor === "function";
    probe.valueOfIsFn = typeof props.valueOf === "function";
    probe.propertyIsEnumerable = props.propertyIsEnumerable("id");
    return <input />;
  };
  const Wrapped = styledFn(Probe)("wrapped");
  renderInto(() => <Wrapped id="a" />);
  expect(probe.hasOwn).toBe(true);
  expect(probe.coerced).toBe("[object Object]");
  expect(probe.toStringIsFn).toBe(true);
  expect(probe.constructorIsFn).toBe(true);
  expect(probe.valueOfIsFn).toBe(true);
  expect(probe.propertyIsEnumerable).toBe(true);
});

it("should still contribute class when a prop shadows an Object.prototype name", () => {
  const seen: Record<string, unknown> = {};
  const Probe = (props: Record<string, unknown>) => {
    seen.class = props.class;
    seen.toString = props.toString;
    return <input />;
  };
  const Wrapped = styledFn(Probe)("wrapped");
  renderInto(() => <Wrapped toString="shadowed" />);
  expect(seen.class).toBe("wrapped");
  expect(seen.toString).toBe("shadowed");
});

// --- element creation -----------------------------------------------------------
// A tag target is created the way the compiler creates `<tag {...props} />`.

it("should create namespaced elements for svg tags", () => {
  const Circle = styledFn("circle")("dot");
  const Svg = styledFn("svg")("canvas");
  const container = renderInto(() => (
    <Svg>
      <Circle r="1" />
    </Svg>
  ));
  const svg = container.querySelector("svg")!;
  const circle = container.querySelector("circle")!;
  expect(svg.namespaceURI).toBe("http://www.w3.org/2000/svg");
  expect(circle.namespaceURI).toBe("http://www.w3.org/2000/svg");
  expect(circle.getAttribute("class")).toBe("dot");
});

it("should keep an html namespace for ambiguous tags outside svg", () => {
  const Link = styledFn("a")("link");
  const container = renderInto(() => <Link href="#x">x</Link>);
  const a = container.querySelector("a")!;
  expect(a.namespaceURI).toBe("http://www.w3.org/1999/xhtml");
  expect(a.className).toBe("link");
});

it("should keep the element and update bindings when props change", () => {
  const [id, setId] = createSignal("one");
  const Box = styledFn("div")("box");
  const container = renderInto(() => <Box id={id()} />);
  const before = container.querySelector("div")!;
  setId("two");
  flush();
  const after = container.querySelector("div")!;
  expect(after).toBe(before);
  expect(after.id).toBe("two");
});
