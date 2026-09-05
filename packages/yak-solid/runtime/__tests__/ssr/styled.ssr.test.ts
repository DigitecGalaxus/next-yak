// Server rendering of styled components. Runs against the server build of
// `@solidjs/web` (see vitest.ssr.config.ts), so this covers the code the
// browser tests never reach: the direct element serializer and the eager
// props path.
import { describe, expect, it } from "vitest";
import { createComponent, isServer, renderToString, ssrElement } from "@solidjs/web";
import { createSignal } from "solid-js";
import { css } from "../../cssLiteral.ts";
import { styled } from "../../styled.ts";
import { YakThemeProvider } from "../../context/index.ts";

const styledFn = styled as any;
const cssFn = css as any;

/**
 * Attribute spacing and order are not part of the contract: yak writes its
 * class and style last, `ssrElement` writes them where the author put them.
 */
const normalize = (html: string) =>
  html.replace(
    /<([a-z0-9]+)((?:\s+[^\s=>/]+(?:=(?:"[^"]*"|[^\s>/]+))?)*)\s*(\/?)>/g,
    (_, tag, attrs, slash) => {
      const list = attrs.match(/[^\s=>/]+(?:=(?:"[^"]*"|[^\s>/]+))?/g) ?? [];
      return (
        "<" +
        tag +
        list
          .sort()
          .map((a: string) => " " + a)
          .join("") +
        slash +
        ">"
      );
    },
  );

const render = (fn: () => unknown) => renderToString(fn as () => any, { noScripts: true });

it("runs against the server build", () => {
  expect(isServer).toBe(true);
});

describe("static tag", () => {
  it("renders the class and the author props", () => {
    const Box = styledFn("div")("box");
    const html = render(() => createComponent(Box, { id: "a", title: "t", children: "hi" }));
    expect(normalize(html)).toBe(normalize('<div _hk=0 id="a" title="t" class="box">hi</div>'));
  });

  it("merges a user class", () => {
    const Box = styledFn("div")("box");
    const html = render(() => createComponent(Box, { class: "user" }));
    expect(normalize(html)).toContain('class="user box"');
  });

  it("drops $ props, theme, component and undefined values", () => {
    const Box = styledFn("input")("box");
    const html = render(() =>
      createComponent(Box, {
        $hidden: true,
        theme: "x",
        component: "span",
        value: undefined,
        name: "n",
      }),
    );
    expect(normalize(html)).toBe(normalize('<input _hk=0 name="n" class="box"/>'));
  });

  it("omits an empty class instead of emitting an empty class attribute", () => {
    const Box = styledFn("div")("");
    const html = render(() => createComponent(Box, { id: "a" }));
    expect(normalize(html)).toBe('<div _hk=0 id="a"></div>');
  });
});

describe("dynamic path", () => {
  it("adds classes and css variables from interpolations", () => {
    const Dot = styledFn("span")("dot", (props: any) => props.$active && cssFn("on"), {
      style: { "--x": (props: any) => props.$x },
    });
    const html = render(() => createComponent(Dot, { $active: true, $x: 4 }));
    expect(normalize(html)).toBe(normalize('<span _hk=0 class="dot on" style="--x:4"></span>'));
  });

  it("reads the theme", () => {
    const Themed = styledFn("span")("t", {
      style: { "--c": (props: any) => props.theme().color },
    });
    void cssFn;
    const html = render(() =>
      createComponent(YakThemeProvider, {
        theme: { color: "red" },
        get children() {
          return createComponent(Themed, {});
        },
      }),
    );
    expect(normalize(html)).toContain('style="--c:red"');
  });

  it("lets attrs override author props and keeps their order", () => {
    const Input = styledFn("input").attrs({ id: "from-attrs", type: "text" })("cls");
    const html = render(() => createComponent(Input, { id: "author", name: "n" }));
    expect(normalize(html)).toBe(
      normalize('<input _hk=0 id="from-attrs" name="n" type="text" class="cls"/>'),
    );
  });
});

describe("component target", () => {
  it("passes class, style and a `component` prop through", () => {
    const seen: Record<string, unknown> = {};
    const Target = (props: any) => {
      seen.keys = Object.keys(props);
      seen.component = props.component;
      return ssrElement("a", { class: props.class, href: props.href }, undefined, true);
    };
    const Link = styledFn(Target)("link");
    const html = render(() => createComponent(Link, { href: "/x", component: "button", $y: 1 }));
    expect(seen.keys).toEqual(["href", "component", "class"]);
    expect(seen.component).toBe("button");
    expect(normalize(html)).toBe(normalize('<a _hk=0 class="link" href="/x"></a>'));
  });
});

describe("serializer parity with ssrElement", () => {
  // the same props through the styled serializer and through Solid's own
  // element serializer must give the same markup, over a generated prop space
  const values: Record<string, unknown[]> = {
    id: ["a", 'q"uote', "1 < 2 & 3", "", 0, 5, true, false, null, undefined],
    title: ["t", "<b>&</b>", ""],
    hidden: [true, false, "", "hidden", undefined],
    tabindex: [0, -1, "0"],
    ref: [() => {}, undefined],
    onClick: [() => {}, "not a handler"],
    "prop:custom": [1],
    "data-x": ["y", 1, false],
    children: ["<b>&</b>", ["a", 1, null, "b", ["c"]], 3, true, undefined, () => "fn"],
    innerHTML: ["<b>raw</b>", undefined],
    textContent: ["text & more"],
    style: [{ color: "red", "--v": 3 }, "color: blue; margin: 0", { a: undefined, b: null }, ""],
    class: [{ a: true, b: false, c: true }, ["x", ["y"], { z: true }], "", "s t"],
  };
  const keys = Object.keys(values);
  // deterministic pseudo-random picks so the matrix is repeatable
  let seed = 7;
  const next = (n: number) => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed % n;
  };
  const tags = ["div", "input", "textarea", "script", "style", "a", "svg", "br"];
  for (let i = 0; i < 120; i++) {
    const props: Record<string, unknown> = {};
    const count = 1 + next(5);
    for (let k = 0; k < count; k++) {
      const key = keys[next(keys.length)];
      props[key] = values[key][next(values[key].length)];
    }
    const tag = tags[next(tags.length)];
    it(`${tag} ${JSON.stringify(Object.keys(props))} #${i}`, () => {
      const Styled = styledFn(tag)("");
      const viaYak = render(() => createComponent(Styled, { ...props }));
      const viaSolid = render(() => ssrElement(tag, { ...props }, undefined, true));
      expect(normalize(viaYak)).toBe(normalize(viaSolid));
    });
  }
});

describe("hydration keys", () => {
  it("gives a styled tag the same key an unstyled tag would get", () => {
    const Box = styledFn("div")("box");
    const styled = render(() => [
      ssrElement("p", {}, undefined, true),
      createComponent(Box, {}),
      ssrElement("p", {}, undefined, true),
    ]);
    const plain = render(() => [
      ssrElement("p", {}, undefined, true),
      ssrElement("div", { class: "box" }, undefined, true),
      ssrElement("p", {}, undefined, true),
    ]);
    expect(normalize(styled)).toBe(normalize(plain));
  });
});

it("does not read props before the hydration key is taken", () => {
  const order: string[] = [];
  const Box = styledFn("div")("box");
  const html = render(() =>
    createComponent(Box, {
      get id() {
        order.push("id");
        return "a";
      },
    }),
  );
  expect(order).toEqual(["id"]);
  expect(html).toContain("_hk=");
});
