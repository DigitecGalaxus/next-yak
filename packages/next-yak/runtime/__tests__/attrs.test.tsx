import React, { FunctionComponent } from "react";
import { render } from "@testing-library/react";
import { beforeEach, expect, describe, it, vi } from "vitest";
import { YakThemeProvider } from "../context";
import { styled as styledFn } from "../styled";

// This transform is usually done by the SWC plugin.
// However this `attrs.test.tsx` does not compile
// the code before testing
const styled = Object.assign(styledFn, {
  div: styledFn("div"),
  h1: styledFn("h1"),
  button: styledFn("button"),
  a: styledFn("a"),
  p: styledFn("p"),
  span: styledFn("span"),
}) as typeof styledFn;

beforeEach(() => {
  vi.spyOn(console, "warn");
});

type DataAttributes = { [key: `data-${string}`]: any };

const getSnapshot = (element: React.ReactElement) =>
  render(element).container.firstChild;

it("works fine with an empty object", () => {
  const Comp = styled.div.attrs({})``;
  expect(getSnapshot(<Comp />)).toMatchInlineSnapshot(`<div />`);
});

it("works fine with a function that returns an empty object", () => {
  const Comp = styled.div.attrs(() => ({}))``;
  expect(getSnapshot(<Comp />)).toMatchInlineSnapshot(`<div />`);
});

it("pass a simple attr via object", () => {
  const Comp = styled.button.attrs({
    type: "button",
  })``;
  expect(getSnapshot(<Comp />)).toMatchInlineSnapshot(`
    <button
      type="button"
    />
  `);
});

it("pass a simple attr via function with object return", () => {
  const Comp = styled.button.attrs(() => ({
    type: "button",
  }))``;
  expect(getSnapshot(<Comp />)).toMatchInlineSnapshot(`
    <button
      type="button"
    />
  `);
});

it("pass a React component", () => {
  const ReactComponent: FunctionComponent = () => <p>React Component</p>;

  type ButtonProps = {
    component: FunctionComponent;
  };

  const Button = ({ component: ChildComponent }: ButtonProps) => (
    <button>
      <ChildComponent />
    </button>
  );

  const Comp = styled(Button).attrs<Partial<ButtonProps>>(() => ({
    component: ReactComponent,
  }))``;

  expect(getSnapshot(<Comp />)).toMatchInlineSnapshot(`
    <button>
      <p>
        React Component
      </p>
    </button>
  `);
});

it("should not call a function passed to attrs as an object value", () => {
  const stub = vi.fn(() => "div");

  const Comp = styled.button.attrs<{ foo?: typeof stub }>(() => ({
    foo: stub,
  }))``;

  render(<Comp />);

  expect(stub).not.toHaveBeenCalled();
});

it("pass props to the attr function", () => {
  const Comp = styled.button.attrs<{ $submit?: boolean }>((p) => ({
    type: p.$submit ? "submit" : "button",
  }))``;

  expect(getSnapshot(<Comp />)).toMatchInlineSnapshot(`
    <button
      type="button"
    />
  `);
  expect(getSnapshot(<Comp $submit />)).toMatchInlineSnapshot(`
    <button
      type="submit"
    />
  `);
});

it("should replace props with attrs", () => {
  const Comp = styled.button.attrs<{ $submit?: boolean }>((p) => ({
    type: p.$submit ? "submit" : "button",
    tabIndex: 0,
  }))``;

  expect(getSnapshot(<Comp />)).toMatchInlineSnapshot(`
    <button
      tabindex="0"
      type="button"
    />
  `);
  expect(getSnapshot(<Comp type="reset" />)).toMatchInlineSnapshot(`
    <button
      tabindex="0"
      type="button"
    />
  `);
  expect(getSnapshot(<Comp type="reset" tabIndex={-1} />))
    .toMatchInlineSnapshot(`
    <button
      tabindex="0"
      type="button"
    />
  `);
});

it("should merge className", () => {
  const Comp = styled.div.attrs(() => ({
    className: "meow nya",
  }))``;

  expect(getSnapshot(<Comp />)).toMatchInlineSnapshot(`
    <div
      class="meow nya"
    />
  `);
});

it("should merge className from folded attrs", () => {
  const Inner = styled.div.attrs({ className: "foo" })``;

  const Comp = styled(Inner).attrs(() => ({
    className: "meow nya",
  }))``;

  expect(getSnapshot(<Comp className="something" />)).toMatchInlineSnapshot(`
    <div
      class="something foo meow nya"
    />
  `);
});

it("should merge className even if its a function", () => {
  const Comp = styled.div.attrs<{ $purr?: boolean }>((p) => ({
    className: `meow ${p.$purr ? "purr" : "nya"}`,
  }))``;

  expect(getSnapshot(<Comp />)).toMatchInlineSnapshot(`
    <div
      class="meow nya"
    />
  `);
  expect(getSnapshot(<Comp $purr />)).toMatchInlineSnapshot(`
    <div
      class="meow purr"
    />
  `);
});

it("should merge style", () => {
  const Comp = styled.div.attrs(() => ({
    style: { color: "red", background: "blue" },
  }))``;

  expect(
    getSnapshot(<Comp style={{ color: "green", borderStyle: "dotted" }} />),
  ).toMatchInlineSnapshot(`
    <div
      style="color: red; border-style: dotted; background: blue;"
    />
  `);
});

it("should work with data and aria attributes", () => {
  const Comp = styled.div.attrs<DataAttributes>(() => ({
    "data-foo": "bar",
    "aria-label": "A simple FooBar",
  }))``;
  expect(getSnapshot(<Comp />)).toMatchInlineSnapshot(`
    <div
      aria-label="A simple FooBar"
      data-foo="bar"
    />
  `);
});

it("merge attrs when inheriting SC", () => {
  let attrsCallCount = 0;
  const Parent = styled.button.attrs(() => {
    // Parent should be called first and only once
    // to behave exactly like styled-components
    expect(attrsCallCount).toEqual(0);
    attrsCallCount++;
    return {
      type: "button",
      tabIndex: 0,
    };
  })``;
  const Child = styled(Parent).attrs(() => {
    // Child should be called second and only once
    // to behave exactly like styled-components
    expect(attrsCallCount).toEqual(1);
    attrsCallCount++;
    return {
      type: "submit",
    };
  })``;
  expect(getSnapshot(<Child />)).toMatchInlineSnapshot(`
    <button
      tabindex="0"
      type="submit"
    />
  `);
});

it("pass attrs to style block", () => {
  /* Would be a React Router Link in real life */
  const Comp = styled.a.attrs<DataAttributes>(() => ({
    href: "#",
    "data-active-class-name": "--is-active",
    // @ts-expect-error
  }))("c1", {
    style: {
      "--testVar": (props: any) => props["data-active-class-name"] && "c2",
    },
  });
  expect(getSnapshot(<Comp />)).toMatchInlineSnapshot(`
    <a
      class="c1"
      data-active-class-name="--is-active"
      href="#"
      style="--testVar: c2;"
    />
  `);
});

it("should pass through children as a normal prop", () => {
  const Comp = styled.div.attrs(() => ({
    children: "Probably a bad idea",
  }))``;
  expect(getSnapshot(<Comp />)).toMatchInlineSnapshot(`
    <div>
      Probably a bad idea
    </div>
  `);
});

it("should pass through complex children as well", () => {
  const Comp = styled.div.attrs(() => ({
    children: <span>Probably a bad idea</span>,
  }))``;
  expect(getSnapshot(<Comp />)).toMatchInlineSnapshot(`
    <div>
      <span>
        Probably a bad idea
      </span>
    </div>
  `);
});

it("should override children", () => {
  const X = styled.div``;
  type XProps = React.ComponentProps<typeof X>["children"] & React.JSX.Element;
  const Comp = styled.div.attrs(() => ({
    children: <span>Amazing</span>,
  }))``;
  expect(getSnapshot(<Comp>Something else</Comp>)).toMatchInlineSnapshot(`
    <div>
      <span>
        Amazing
      </span>
    </div>
  `);
});

it('should shallow merge "style" prop + attr instead of overwriting', () => {
  const Paragraph = styled.p.attrs<{ $fontScale?: number }>((p) => ({
    style: {
      ...p.style,
      fontSize: `${p.$fontScale}em`,
    },
  }))<{ $fontScale: number }>``;

  const Text: FunctionComponent<
    Partial<React.ComponentProps<typeof Paragraph>>
  > = (props) => {
    const fontScale = 4;

    return (
      <Paragraph $fontScale={fontScale} {...props}>
        {props.children}
      </Paragraph>
    );
  };

  const BlueText = styled(Text).attrs(() => ({
    style: {
      color: "blue",
    },
  }))``;

  expect(getSnapshot(<BlueText>Hello</BlueText>)).toMatchInlineSnapshot(`
    <p
      style="color: blue; font-size: 4em;"
    >
      Hello
    </p>
  `);
});

it("does not pass transient props to HTML element", () => {
  type CompProps = { $textColor: string };

  const Comp = styled.div<CompProps>`
    color: ${(props) => props.$textColor};
  `;

  const StyledComp = styled(Comp).attrs<Partial<CompProps>>(() => ({
    $textColor: "red",
  }))``;

  expect(getSnapshot(<StyledComp />)).toMatchInlineSnapshot(`<div />`);
});

it.skip('should apply given "as" prop to the progressive type', () => {
  const Comp = styled.div.attrs<{ as?: any }>({ as: "video" as const })``;

  //@ts-expect-error
  expect(getSnapshot(<Comp loop />)).toMatchInlineSnapshot();
});

// our own tests
it("should remap props", () => {
  const Comp = styled.button.attrs<{ primary?: boolean; $submit?: boolean }>(
    (p) => ({
      type: p.$submit ? "submit" : "button",
      $disabled: p.disabled,
    }),
  )<{ $disabled?: boolean }>``;

  expect(getSnapshot(<Comp />)).toMatchInlineSnapshot(`
    <button
      type="button"
    />
  `);
  expect(getSnapshot(<Comp disabled />)).toMatchInlineSnapshot(`
    <button
      disabled=""
      type="button"
    />
  `);
  expect(getSnapshot(<Comp $submit />)).toMatchInlineSnapshot(`
    <button
      type="submit"
    />
  `);
});

it("should have optional attrs props as component interface", () => {
  const Comp = styled.h1.attrs<{ $primary?: boolean }>({
    $primary: true,
  })``;

  expect(getSnapshot(<Comp />)).toMatchInlineSnapshot(`<h1 />`);
  expect(getSnapshot(<Comp $primary />)).toMatchInlineSnapshot(`<h1 />`);
});

it("should have access to theme", () => {
  const ThemePrinter = ({ theme, ...props }: { theme?: unknown }) => (
    <pre {...props}>{JSON.stringify(theme)}</pre>
  );
  const Comp = styled(ThemePrinter).attrs<DataAttributes>((p) => ({
    "data-color": (p.theme as { color: string }).color,
  }))``;

  expect(
    getSnapshot(
      <YakThemeProvider theme={{ color: "red" }}>
        <Comp />
      </YakThemeProvider>,
    ),
  ).toMatchInlineSnapshot(`
    <pre
      data-color="red"
    />
  `);
});

it("should pass theme if theme is overwritten", () => {
  const ThemePrinter = ({ theme, ...props }: { theme?: unknown }) => (
    <pre {...props}>{JSON.stringify(theme)}</pre>
  );
  const Comp = styled(ThemePrinter).attrs({
    theme: { color: "blue" },
  })``;

  expect(
    getSnapshot(
      <YakThemeProvider theme={{ color: "red" }}>
        <Comp />
      </YakThemeProvider>,
    ),
  ).toMatchInlineSnapshot(`
    <pre>
      {"color":"blue"}
    </pre>
  `);
});

describe("attrs bug next-yak/issues/163", () => {
  it("should allow to delete a prop", () => {
    const Comp = styled.h1.attrs<{ primary?: boolean }>({
      primary: undefined,
    })``;

    expect(getSnapshot(<Comp primary />)).toMatchInlineSnapshot(`<h1 />`);
  });

  it("should allow to rename a prop", () => {
    const Comp = styled.h1.attrs<{ primary?: boolean }>((p) => ({
      ...p,
      primary: undefined,
      $primary: p.primary,
    }))``;

    expect(getSnapshot(<Comp primary />)).toMatchInlineSnapshot(`<h1 />`);
  });

  it("should allow to rename a prop in overwritten attrs", () => {
    const Parent = styled.h1.attrs<{ count: number }>((p) => {
      expect(p.count).toBe(1);
      return {
        count: ++p.count,
      };
    })``;
    const Comp = styled(Parent).attrs<{ count: number }>((p) => {
      expect(p.count).toBe(2);
      return {
        count: ++p.count,
      };
    })``;

    expect(getSnapshot(<Comp count={1} />)).toMatchInlineSnapshot(`
      <h1
        count="3"
      />
    `);
  });
});
