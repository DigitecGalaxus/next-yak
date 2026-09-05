// One component tree, rendered on the server by the SSR test project and
// hydrated in the browser test project from the resulting snapshot. It is
// written with `createComponent` and getters, the shape the compiler emits, so
// it needs no JSX transform in either project. Every runtime path is on it:
// a static tag, a dynamic interpolation with a css variable, attrs, a
// component target that spreads its props, a nested chain, svg, and one of
// the tags whose namespace depends on the parent.
import { createComponent, omit } from "solid-js";
import type { Accessor } from "solid-js";
import { css } from "../../cssLiteral.ts";
import { styled } from "../../styled.ts";

const styledFn = styled as any;
const cssFn = css as any;

export const Card = styledFn("section")("card");
export const Dot = styledFn("span")("dot", (props: any) => props.$active && cssFn("active"), {
  style: { "--x": (props: any) => props.$x },
});
export const Field = styledFn("input").attrs({ type: "text" })("field");
export const Base = styledFn("button")("base");
export const Ghost = styledFn(Base)("ghost");
export const Link = styledFn("a")("link");
export const Icon = styledFn("svg")("icon");
export const Shape = styledFn("circle")("shape");

// a component target that spreads the rest of its props, as design-system
// components do; `label` is consumed here and must not reach the element
export const Chip = styledFn((props: any) =>
  createComponent(Card, {
    get children() {
      return [props.label, createComponent(Base, omit(props, "label", "class") as any)];
    },
    get class() {
      return props.class;
    },
  }),
)("chip");

export const createTree = (i: Accessor<number>) =>
  createComponent(Card, {
    id: "tree",
    get children() {
      return [
        createComponent(Dot, {
          get $active() {
            return i() % 2 === 0;
          },
          get $x() {
            return i();
          },
          get children() {
            return String(i());
          },
        }),
        createComponent(Field, { name: "q", $hidden: true }),
        createComponent(Ghost, { children: "go" }),
        createComponent(Link, { href: "#", children: "link" }),
        createComponent(Icon, {
          get children() {
            return createComponent(Shape, { r: "2" });
          },
        }),
        createComponent(Chip, { label: "chip", title: "t", children: "x" }),
      ];
    },
  });
