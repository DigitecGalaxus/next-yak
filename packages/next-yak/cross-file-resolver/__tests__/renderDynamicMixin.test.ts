import { assert, expect, test } from "vitest";
import {
  computeOpenScopes,
  escapeCssClassName,
  renderDynamicMixin,
  splitMixinPayload,
} from "../renderDynamicMixin.js";

const payload = [
  "color: black;",
  "@yak-branch b0 {",
  "  color: red;",
  "  &:hover { color: darkred; }",
  "}",
  "",
].join("\n");

test("splitMixinPayload returns ordered static and branch segments", () => {
  const segments = splitMixinPayload(
    ["margin: 0;", "@yak-branch b0 {", "  color: red;", "}", "padding: 4px;"].join("\n"),
  );
  expect(segments.map((segment) => segment.type)).toEqual(["static", "branch", "static"]);
  assert.strictEqual(segments[0].css.trim(), "margin: 0;");
  assert.strictEqual(segments[1].type === "branch" && segments[1].id, 0);
  assert.strictEqual(segments[1].css.trim(), "color: red;");
  assert.strictEqual(segments[2].css.trim(), "padding: 4px;");
});

test("splitMixinPayload keeps payloads without branches untouched", () => {
  const segments = splitMixinPayload("color: blue;\n");
  expect(segments).toEqual([{ type: "static", css: "color: blue;\n" }]);
});

test("escapeCssClassName escapes selector-hostile characters", () => {
  assert.strictEqual(escapeCssClassName("aspectRatios_16:9_x-b0"), "aspectRatios_16\\:9_x-b0");
  assert.strictEqual(escapeCssClassName("Button__highlight_x-b0"), "Button__highlight_x-b0");
});

test("computeOpenScopes tracks nested selectors and at-rules", () => {
  const css = `.a {\n  @media (min-width: 100px) {\n    &:hover {\n      HERE\n    }\n  }\n}`;
  const scopes = computeOpenScopes(css, css.indexOf("HERE"));
  expect(scopes).toEqual([".a", "@media (min-width: 100px)", "&:hover"]);
});

test("computeOpenScopes ignores braces in comments and strings", () => {
  const css = `.a {\n  /* } { */\n  content: "}";\n  HERE\n}`;
  const scopes = computeOpenScopes(css, css.indexOf("HERE"));
  expect(scopes).toEqual([".a"]);
});

test("renders a dynamic mixin at the top level of a styled component", () => {
  const css = [
    ":global(.Button_x) {",
    "  padding: 10px;",
    "  MARKER",
    "  color: green;",
    "}",
  ].join("\n");

  const replacement = renderDynamicMixin({
    css,
    position: css.indexOf("MARKER"),
    payload,
    scopePrefix: "Button__highlight_x",
  });

  expect(replacement).toMatchInlineSnapshot(`
    "color: black;
    }
    :global(.Button__highlight_x-b0) {
    color: red;
      &:hover { color: darkred; }
    }
    :global(.Button_x) {"
  `);
});

test("keeps the cascade position of static css between branches", () => {
  const interleavedPayload = [
    "color: black;",
    "@yak-branch b0 {",
    "  color: red;",
    "}",
    "font-weight: bold;",
    "@yak-branch b1 {",
    "  color: blue;",
    "}",
  ].join("\n");
  const css = [":global(.Button_x) {", "  MARKER", "}"].join("\n");

  const replacement = renderDynamicMixin({
    css,
    position: css.indexOf("MARKER"),
    payload: interleavedPayload,
    scopePrefix: "Button__mix_x",
  });

  expect(replacement).toMatchInlineSnapshot(`
    "color: black;
    }
    :global(.Button__mix_x-b0) {
    color: red;
    }
    :global(.Button_x) {
    font-weight: bold;
    }
    :global(.Button__mix_x-b1) {
    color: blue;
    }
    :global(.Button_x) {"
  `);
});

test("replays the nesting context inside hoisted branch rules", () => {
  const css = [
    ":global(.Button_x) {",
    "  &:hover {",
    "    MARKER",
    "  }",
    "}",
  ].join("\n");

  const replacement = renderDynamicMixin({
    css,
    position: css.indexOf("MARKER"),
    payload,
    scopePrefix: "Button__highlight_x",
  });

  expect(replacement).toMatchInlineSnapshot(`
    "color: black;
    }
    }
    :global(.Button__highlight_x-b0) {
    &:hover {
    color: red;
      &:hover { color: darkred; }
    }
    }
    :global(.Button_x) {
    &:hover {"
  `);
});

test("uses plain class selectors in Css transpilation mode", () => {
  const css = [".Button_x {", "  MARKER", "}"].join("\n");

  const replacement = renderDynamicMixin({
    css,
    position: css.indexOf("MARKER"),
    payload,
    scopePrefix: "Button__highlight_x",
    transpilationMode: "Css",
  });

  expect(replacement).toContain(".Button__highlight_x-b0 {");
  expect(replacement).not.toContain(":global(");
});

test("substitutes slot markers with prefixes derived from the usage site", () => {
  const slotPayload = [
    "font-size: 16px;",
    '--yak-css-import: url("./a:inner",mixin,@s0);',
    "@yak-branch b0 {",
    "  border: 1px solid;",
    "}",
  ].join("\n");
  const css = [":global(.Card_x) {", "  MARKER", "}"].join("\n");

  const replacement = renderDynamicMixin({
    css,
    position: css.indexOf("MARKER"),
    payload: slotPayload,
    scopePrefix: "Card__outer_x",
  });

  expect(replacement).toContain(
    '--yak-css-import: url("./a:inner",mixin,"Card__outer_x-s0");',
  );
});

test("rejects branch splicing without a rule context (outdated compiler output)", () => {
  expect(() =>
    renderDynamicMixin({
      css: "MARKER",
      position: 0,
      payload,
      scopePrefix: "Button__highlight_x",
    }),
  ).toThrow("compiled by an outdated yak compiler");
});
