// @ts-nocheck These are runtime tests and the external API isn't the runtime (after compile) API
import { css } from "../cssLiteral";
import { dynamicMixin, useDynamicMixin } from "../internals/dynamicMixin";

// Simulates the compiled output of a producer file exporting a dynamic mixin:
//
// export const highlight = css`
//   color: black;
//   ${({ $active }) => $active && css`color: red;`}
// `;
const highlight = dynamicMixin((b) => [({ $active }) => $active && css(b(0))]);

describe("dynamicMixin / useDynamicMixin", () => {
  it("toggles the scoped branch class when the condition is true", () => {
    const classNames = new Set<string>();
    const style: React.CSSProperties = {};

    const processor = useDynamicMixin(highlight, "Button__u0_x");
    processor({ theme: {}, $active: true }, classNames, style);

    expect(classNames.has("Button__u0_x-b0")).toBe(true);
  });

  it("adds no class when the condition is false", () => {
    const classNames = new Set<string>();
    const style: React.CSSProperties = {};

    const processor = useDynamicMixin(highlight, "Button__u0_x");
    processor({ theme: {}, $active: false }, classNames, style);

    expect(classNames.size).toBe(0);
  });

  it("scopes the same mixin independently per usage site", () => {
    const classNames = new Set<string>();
    const style: React.CSSProperties = {};
    const props = { theme: {}, $active: true };

    useDynamicMixin(highlight, "Button__u0_x")(props, classNames, style);
    useDynamicMixin(highlight, "Card__u0_x")(props, classNames, style);

    expect(classNames.has("Button__u0_x-b0")).toBe(true);
    expect(classNames.has("Card__u0_x-b0")).toBe(true);
  });

  it("composes as an argument of a consumer's css()/styled call", () => {
    const classNames = new Set<string>();
    const style: React.CSSProperties = {};

    // compiled consumer: __yak_button("Button_x", __yak_use(highlight, "Button__u0_x"))
    const consumer = css("Button_x", useDynamicMixin(highlight, "Button__u0_x"));
    consumer({ theme: {}, $active: true }, classNames, style);

    expect(classNames.has("Button_x")).toBe(true);
    expect(classNames.has("Button__u0_x-b0")).toBe(true);
  });

  it("handles css variable objects returned by the factory", () => {
    // export const pad = css`padding: ${({ $pad }) => $pad}px;`
    const pad = dynamicMixin(() => [
      {
        style: {
          "--styles_pad__padding_x": (props) => `${props.$pad}px`,
        },
      },
    ]);
    const classNames = new Set<string>();
    const style: React.CSSProperties = {};

    useDynamicMixin(pad, "Button__u1_x")({ theme: {}, $pad: 4 }, classNames, style);

    expect(style["--styles_pad__padding_x"]).toBe("4px");
  });

  it("is a no-op for static mixins (compiled to a plain css() value)", () => {
    const staticMixin = css();
    const classNames = new Set<string>();
    const style: React.CSSProperties = {};

    const processor = useDynamicMixin(staticMixin, "Button__u0_x");
    processor({ theme: {} }, classNames, style);

    expect(classNames.size).toBe(0);
    expect(Object.keys(style).length).toBe(0);
  });

  it("is a no-op for unresolved values (e.g. undefined from a 'use client' boundary)", () => {
    const classNames = new Set<string>();
    const style: React.CSSProperties = {};

    expect(() => {
      useDynamicMixin(undefined, "Button__u0_x")({ theme: {} }, classNames, style);
      useDynamicMixin(null, "Button__u0_x")({ theme: {} }, classNames, style);
    }).not.toThrow();
    expect(classNames.size).toBe(0);
  });

  it("supports the recursion scope handle (b.sub) for nested cross-file mixins", () => {
    // producer a.ts: export const inner = css`${({ $a }) => $a && css`color: red;`}`
    const inner = dynamicMixin((b) => [({ $a }) => $a && css(b(0))]);
    // producer b.ts: export const outer = css`${inner}; ${({ $b }) => $b && css`border: 1px solid;`}`
    const outer = dynamicMixin((b) => [
      useDynamicMixin(inner, b.sub(0)),
      ({ $b }) => $b && css(b(0)),
    ]);

    const classNames = new Set<string>();
    const style: React.CSSProperties = {};

    const processor = useDynamicMixin(outer, "Card__u0_x");
    processor({ theme: {}, $a: true, $b: true }, classNames, style);

    expect(classNames.has("Card__u0_x-s0-b0")).toBe(true);
    expect(classNames.has("Card__u0_x-b0")).toBe(true);
  });
});
