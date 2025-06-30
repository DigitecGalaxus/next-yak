// @ts-nocheck
// We are testing internal functionality which does not match
// 1:1 the API exposed to the user before compilation.
// Therfefore types are not matching and need to be ignored.
import { render } from "@testing-library/react";
import React from "react";
import { expect, it } from "vitest";
import { YakThemeProvider } from "../context";
import { css } from "../cssLiteral";
import { styled as styledFn } from "../styled";
import { atoms } from "../atoms";

// This transform is usually done by the SWC plugin.
// However this `styled.test.tsx` does not compile
// the code before testing
const styled = Object.assign(styledFn, {
  div: styledFn("div"),
  input: styledFn("input"),
  a: styledFn("a"),
}) as typeof styledFn;

it("should render a literal element", () => {
  const Component = styled.input``;

  const { container } = render(<Component />);

  expect(container).toMatchInlineSnapshot(`
    <div>
      <input />
    </div>
  `);
});

it("should render a literal element with styles", () => {
  const Component = styled.input("cssClass");

  const { container } = render(<Component />);

  expect(container).toMatchInlineSnapshot(`
    <div>
      <input
        class="cssClass"
      />
    </div>
  `);
});

it("should forward properties", () => {
  const Component = styled.input("cssClass");

  const { container } = render(<Component defaultValue="forwarded" />);

  expect(container).toMatchInlineSnapshot(`
    <div>
      <input
        class="cssClass"
        value="forwarded"
      />
    </div>
  `);
});

it("should forward children", () => {
  const Component = styled.div``;

  const { container } = render(
    <Component>
      <button>Click me!</button>
    </Component>,
  );

  expect(container).toMatchInlineSnapshot(`
    <div>
      <div>
        <button>
          Click me!
        </button>
      </div>
    </div>
  `);
});

it("should filter out properties starting with $", () => {
  const Component = styled.input``;

  const { container } = render(<Component $forwardedProp="notForwarded" />);

  expect(container).toMatchInlineSnapshot(`
    <div>
      <input />
    </div>
  `);
});

it("should filter out properties starting with $ when passing to custom", () => {
  let forwardedProps = null;
  const Component = ({ className, style, ...props }) => {
    forwardedProps = props;
    return null;
  };
  const StyledComponent = styled(Component)``;
  render(<StyledComponent $forwardedProp="notForwarded" />);

  expect(forwardedProps).toEqual({});
});

it("should forward properties to the next yak component", () => {
  const Component = styled.input.attrs(({ $text }) => ({
    "aria-label": $text,
  }))``;
  const StyledComponent = styled(Component)``;
  const { container } = render(<StyledComponent $text="hello world" />);

  expect(container).toMatchInlineSnapshot(`
    <div>
      <input
        aria-label="hello world"
      />
    </div>
  `);
});

it("should concatenate classNames", () => {
  const Component = styled.input("className1");

  const { container } = render(<Component className="className2" />);

  expect(container).toMatchInlineSnapshot(`
    <div>
      <input
        class="className2 className1"
      />
    </div>
  `);
});

it("should concatenate styles", () => {
  const Component = styled.input``;

  const { container } = render(<Component style={{ color: "red" }} />);

  expect(container).toMatchInlineSnapshot(`
    <div>
      <input
        style="color: red;"
      />
    </div>
  `);
});

it("should not add class if prop is not set", () => {
  const Component = styled.input(({ testProp }) => testProp && css("test"));

  const { container } = render(<Component />);

  expect(container).toMatchInlineSnapshot(`
    <div>
      <input />
    </div>
  `);
});

it("should add class if prop is set", () => {
  const Component = styled.input(({ $testProp }) => $testProp && css("test"));

  const { container } = render(<Component $testProp />);

  expect(container).toMatchInlineSnapshot(`
    <div>
      <input
        class="test"
      />
    </div>
  `);
});

it("should allow falsy values", () => {
  const Component = styled.input(({ $testProp }) => $testProp && css("test"));

  const { container } = render(
    <>
      <Component $testProp={null} />
      <Component $testProp={false} />
      <Component $testProp={undefined} />
    </>,
  );

  expect(container).toMatchInlineSnapshot(`
    <div>
      <input />
      <input />
      <input />
    </div>
  `);
});

it("should execute runtime styles recursively", () => {
  const Component = styled.input<{
    $testProp: boolean;
  }>(
    ({ $testProp }) =>
      $testProp &&
      css(
        ({ $testProp }) =>
          $testProp &&
          css(({ $testProp }) => $testProp && css("recursive-test-class")),
      ),
  );

  const { container } = render(<Component $testProp />);

  expect(container).toMatchInlineSnapshot(`
    <div>
      <input
        class="recursive-test-class"
      />
    </div>
  `);
});

it("should allow using refs", () => {
  const Component = styled.input();

  let elementFromRef: HTMLInputElement | null = null;
  render(
    <Component
      ref={(element) => {
        elementFromRef = element;
      }}
    />,
  );

  expect(elementFromRef).toBeInstanceOf(HTMLInputElement);
});

it("should allow using nested refs", () => {
  const BaseComponent = styled.input();
  const Component = styled(BaseComponent)();

  let elementFromRef: HTMLInputElement | null = null;
  render(
    <Component
      ref={(element) => {
        elementFromRef = element;
      }}
    />,
  );

  expect(elementFromRef).toBeInstanceOf(HTMLInputElement);
});

it("should remove theme if styled element", () => {
  const Link = styled.a((p) => p && css("test"));

  const { container } = render(
    <YakThemeProvider theme={{ color: "red" }}>
      <Link />
    </YakThemeProvider>,
  );

  expect(container).toMatchInlineSnapshot(`
    <div>
      <a
        class="test"
      />
    </div>
  `);
});

it("should keep theme if theme is passed to element", () => {
  const ThemePrinter = ({ theme, ...props }: { theme?: unknown }) => (
    <pre {...props}>{JSON.stringify(theme)}</pre>
  );
  const Link = styled(ThemePrinter)((p) => p && css("test"));

  const { container } = render(
    <YakThemeProvider theme={{ color: "red" }}>
      <Link theme={{ anything: "test" }} />
    </YakThemeProvider>,
  );

  expect(container).toMatchInlineSnapshot(`
    <div>
      <pre
        class="test"
      >
        {"anything":"test"}
      </pre>
    </div>
  `);
});

it("should remove theme on wrapped element", () => {
  const BaseComponent = styled.input((p) => p && css("test"));
  const Component = styled(BaseComponent)((p) => p && css("test-wrapper"));

  const { container } = render(
    <YakThemeProvider theme={{ color: "red" }}>
      <Component />
    </YakThemeProvider>,
  );

  expect(container).toMatchInlineSnapshot(`
    <div>
      <input
        class="test test-wrapper"
      />
    </div>
  `);
});

it("should not remove theme if theme is passed to wrapped element", () => {
  const ThemePrinter = ({ theme, ...props }: { theme?: unknown }) => (
    <pre {...props}>{JSON.stringify(theme)}</pre>
  );

  const BaseComponent = styled(ThemePrinter)((p) => p && css("test"));
  const Component = styled(BaseComponent)((p) => p && css("test-wrapper"));

  const { container } = render(
    <YakThemeProvider theme={{ color: "red" }}>
      <Component theme={{ anything: "test" }} />
    </YakThemeProvider>,
  );

  expect(container).toMatchInlineSnapshot(`
    <div>
      <pre
        class="test test-wrapper"
      >
        {"anything":"test"}
      </pre>
    </div>
  `);
});

describe("dev mode - error tests", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalError = console.error;

  beforeEach(() => {
    // errors are only thrown in development mode
    process.env.NODE_ENV = "development";
    // prevent console.error from printing the error a second time
    console.error = () => {};
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    console.error = originalError;
  });

  it("should show the function body in error message when dynamic css function returns invalid value", () => {
    const Component = styled.div("cssClass", {
      style: {
        "--bar": ({ $groupColor }) => $groupColor,
      },
    });

    let error = null;
    try {
      render(<Component />);
    } catch (e) {
      error = e;
    }
    expect(error).toMatchInlineSnapshot(`
      [Error: Dynamic CSS functions must return a string or number but returned undefined

      Dynamic CSS function: ({ $groupColor }) => $groupColor
      ]
    `);
  });
});

describe("dynamic runtime function processing", () => {
  let consoleSpy: any;

  beforeEach(() => {
    consoleSpy = {
      log: [],
      originalLog: console.log,
    };
    console.log = (...args) => {
      consoleSpy.log.push(args.join(" "));
    };
  });

  afterEach(() => {
    console.log = consoleSpy.originalLog;
  });

  it("should execute atoms runtime functions", () => {
    const Component = styled.div(
      atoms("static-class", (props, classNames, style) => {
        classNames.add("dynamic-class");
        style.fontSize = "16px";
      }),
    );
    const { container } = render(<Component />);
    expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="static-class dynamic-class"
            style="font-size: 16px;"
          />
        </div>
      `);
  });

  it("should execute combined css and atoms runtime functions", () => {
    const Component = styled.div(
      ({ $primary }) => $primary && css("color-primary"),
      atoms("atoms-class", (props, classNames, style) => {
        classNames.add("atoms-dynamic");
        style.padding = "10px";
      }),
    );
    const { container } = render(<Component $primary />);
    expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="color-primary atoms-class atoms-dynamic"
            style="padding: 10px;"
          />
        </div>
      `);
  });

  it("should not duplicate runtime processing in nested components", () => {
    const BaseComponent = styled.div(
      atoms("base-class", () => console.log("Base runtime executed")),
    );

    const ExtendedComponent = styled(BaseComponent)(
      atoms("extended-class", () => console.log("Extended runtime executed")),
    );

    render(<ExtendedComponent />);

    expect(consoleSpy.log).toEqual([
      "Base runtime executed",
      "Extended runtime executed",
    ]);
    expect(consoleSpy.log).toHaveLength(2);
  });

  it("should execute nested runtime functions in correct order", () => {
    const executionOrder = [];

    const Level1 = styled.div(atoms(() => executionOrder.push("level1")));

    const Level2 = styled(Level1)(atoms(() => executionOrder.push("level2")));

    const Level3 = styled(Level2)(atoms(() => executionOrder.push("level3")));

    render(<Level3 />);

    expect(executionOrder).toEqual(["level1", "level2", "level3"]);
  });

  it("should allow runtime functions to see previous modifications", () => {
    const Component = styled.div(
      atoms("first-class", (props, classNames, style) => {
        classNames.add("first-dynamic");
        style.color = "red";
      }),
      atoms((props, classNames, style) => {
        // Should see modifications from first atoms call
        expect(classNames.has("first-class")).toBe(true);
        expect(classNames.has("first-dynamic")).toBe(true);
        expect(style.color).toBe("red");

        classNames.add("second-dynamic");
        style.backgroundColor = "blue";
      }),
    );

    const { container } = render(<Component />);
    expect(container).toMatchInlineSnapshot(`
       <div>
         <div
           class="first-class first-dynamic second-dynamic"
           style="color: red; background-color: blue;"
         />
       </div>
     `);
  });

  it("should provide theme to runtime functions", () => {
    const Component = styled.div(
      atoms((props, classNames, style) => {
        style.color = props.theme?.primaryColor || "black";
        classNames.add("themed");
      }),
    );

    const { container } = render(
      <YakThemeProvider theme={{ primaryColor: "purple" }}>
        <Component />
      </YakThemeProvider>,
    );

    expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="themed"
            style="color: purple;"
          />
        </div>
      `);
  });

  it("should merge external props with runtime modifications", () => {
    const Component = styled.div(
      atoms("runtime-class", (props, classNames, style) => {
        style.fontSize = "18px";
      }),
    );

    const { container } = render(
      <Component
        className="external-class"
        style={{ color: "green", fontSize: "14px" }}
      />,
    );

    expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="external-class runtime-class"
            style="color: green; font-size: 18px;"
          />
        </div>
      `);
  });

  it("should handle conditional runtime functions", () => {
    const Component = styled.div(
      ({ $variant }) => $variant === "primary" && css("bg-blue"),
      atoms(
        ({ $size }, classNames) => {
          if ($size === "large") {
            classNames.add("large-class");
          }
        },
        (props, classNames, style) => {
          if (props.$active) {
            classNames.add("active");
            style.borderWidth = "2px";
          }
        },
      ),
    );

    const { container } = render(
      <>
        <Component $variant="primary" $size="large" $active />
        <Component $variant="secondary" $size="small" />
      </>,
    );

    expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="bg-blue large-class active"
            style="border-width: 2px;"
          />
          <div />
        </div>
      `);
  });

  it("should filter $ props but still use them in runtime functions", () => {
    const Component = styled.div(
      atoms((props, classNames, style) => {
        if (props.$variant) {
          classNames.add(`variant-${props.$variant}`);
          style.padding = props.$spacing || "8px";
        }
      }),
    );

    const { container } = render(
      <Component $variant="primary" $spacing="16px" />,
    );

    const element = container.querySelector("div");
    // Should not have $ props as DOM attributes
    expect(element.getAttribute("$variant")).toBeNull();
    expect(element.getAttribute("$spacing")).toBeNull();

    // But should have styles/classes generated from them
    expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="variant-primary"
            style="padding: 16px;"
          />
        </div>
      `);
  });

  it("should handle runtime functions that return falsy values", () => {
    const Component = styled.div(
      ({ $show }) => $show && css("block"),
      atoms(
        ({ $variant }, classNames) => {
          if ($variant === "primary") {
            classNames.add(`variant-${$variant}`);
          }
        },
        null,
        undefined,
        false && "never-added",
      ),
    );

    const { container } = render(
      <>
        <Component $show $variant="primary" />
        <Component />
      </>,
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="block variant-primary"
        />
        <div />
      </div>
    `);
  });
});
