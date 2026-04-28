import * as path from "node:path";
import { assert, expect, test, vi } from "vitest";
import { parseExports } from "../../loaders/lib/resolveCrossFileSelectors.js";
import { ParsedModule, parseModule } from "../parseModule.js";
import { resolveCrossFileConstant } from "../resolveCrossFileConstant.js";

/**
 * Creates a resolve context that wires real source strings through
 * parseExports → parseModule → resolveCrossFileConstant.
 */
function createParseContext(files: Record<string, string>) {
  return {
    parse: (modulePath: string) =>
      parseModule(
        {
          extractExports: (p: string) => parseExports(files[p]),
          getTransformed: () => ({ code: "" }),
        },
        modulePath,
      ),
    resolve(specifier: string, importer: string) {
      return path.resolve(path.dirname(importer), specifier);
    },
  };
}

test("resolve css with no cross-file constant", async () => {
  const css = "color:red";
  const { resolved, dependencies } = await resolveCrossFileConstant(
    {
      parse() {
        assert.fail(
          "no file should be parsed for css with no cross-file constant",
        );
      },
      resolve() {
        assert.fail(
          "no file should be resolved for css with no cross-file constant",
        );
      },
    },
    "foo/bar.js",
    css,
  );

  assert.strictEqual(resolved, css);
  assert.strictEqual(dependencies.length, 0);
});

test("resolve css with cross-file constant from 1 depth named import", async () => {
  const { resolved, dependencies } = await resolveCrossFileConstant(
    createParseContext({
      "/foo/constant.ts": `export const color = "red";`,
    }),
    "/foo/bar.ts",
    `color: --yak-css-import: url("./constant.ts:color",mixin);`,
  );

  assert.strictEqual(resolved, "color: red;");
  assert.deepEqual(dependencies, ["/foo/constant.ts"]);
});

test("resolve css with cross-file constant from 2 depth named import", async () => {
  const { resolved, dependencies } = await resolveCrossFileConstant(
    createParseContext({
      "/foo/proxy.ts": `export { RED_500 as primaryColor } from "./constant.ts";`,
      "/foo/constant.ts": `export const RED_500 = "red";`,
    }),
    "/foo/bar.ts",
    `color: --yak-css-import: url("./proxy.ts:primaryColor",mixin);`,
  );

  assert.strictEqual(resolved, "color: red;");
  expect(dependencies).to.have.members(["/foo/constant.ts", "/foo/proxy.ts"]);
});

test("resolve css with cross-file constant from namespace re-export", async () => {
  const { resolved, dependencies } = await resolveCrossFileConstant(
    createParseContext({
      "/foo/proxy.ts": `export * as colors from "./constant.ts";`,
      "/foo/constant.ts": `export const RED_500 = "red";`,
    }),
    "/foo/bar.ts",
    `color: --yak-css-import: url("./proxy.ts:colors:RED_500",mixin);`,
  );

  assert.strictEqual(resolved, "color: red;");
  expect(dependencies).to.have.members(["/foo/constant.ts", "/foo/proxy.ts"]);
});

test("resolve css with cross-file constant from star export", async () => {
  const { resolved, dependencies } = await resolveCrossFileConstant(
    createParseContext({
      "/foo/proxy.ts": [
        `export * from "./zindex.ts";`,
        `export * from "./colors.ts";`,
      ].join("\n"),
      "/foo/colors.ts": `export const RED_500 = "red";`,
      "/foo/zindex.ts": [
        `export const OVER = "1";`,
        `export const HEADER = "50";`,
        `export const MODAL = "100";`,
      ].join("\n"),
    }),
    "/foo/bar.ts",
    `color: --yak-css-import: url("./proxy.ts:RED_500",mixin);`,
  );

  assert.strictEqual(resolved, "color: red;");
  expect(dependencies).to.have.members(["/foo/proxy.ts", "/foo/colors.ts"]);
});

test("resolve css with cross-file constant from deep object", async () => {
  const { resolved, dependencies } = await resolveCrossFileConstant(
    createParseContext({
      "/foo/colors.ts": `export const colors = { RED_500: "red" };`,
    }),
    "/foo/bar.ts",
    `color: --yak-css-import: url("./colors.ts:colors:RED_500",mixin);`,
  );

  assert.strictEqual(resolved, "color: red;");
  expect(dependencies).to.have.members(["/foo/colors.ts"]);
});

test("resolve negative number constant (#185)", async () => {
  const { resolved } = await resolveCrossFileConstant(
    createParseContext({
      "/foo/constants.ts": `export const z = -1;`,
    }),
    "/foo/bar.ts",
    `z-index: --yak-css-import: url("./constants.ts:z",mixin);`,
  );

  assert.strictEqual(resolved, "z-index: -1;");
});

test("resolve constant from object with as const", async () => {
  const { resolved } = await resolveCrossFileConstant(
    createParseContext({
      "/foo/theme.ts": `export const colors = { red: "#ff0000" } as const;`,
    }),
    "/foo/bar.ts",
    `color: --yak-css-import: url("./theme.ts:colors:red",mixin);`,
  );

  assert.strictEqual(resolved, "color: #ff0000;");
});

test("resolve constant from object with satisfies keyword (#394)", async () => {
  const { resolved } = await resolveCrossFileConstant(
    createParseContext({
      "/foo/sizes.ts": `
type Size = "tiny" | "small" | "medium" | "huge";

export const sizes = {
  tiny: 16,
  small: 24,
  medium: 40,
  huge: 96
} satisfies Record<Size, number>;
`,
    }),
    "/foo/bar.ts",
    `height: --yak-css-import: url("./sizes.ts:sizes:huge",mixin);`,
  );

  assert.strictEqual(resolved, "height: 96;");
});

test("resolve default export via variable (#370)", async () => {
  const { resolved } = await resolveCrossFileConstant(
    createParseContext({
      "/foo/theme.ts": `
const color = "blue";
export default color;
`,
    }),
    "/foo/bar.ts",
    `color: --yak-css-import: url("./theme.ts:default",mixin);`,
  );

  assert.strictEqual(resolved, "color: blue;");
});

test("resolve deeply nested object constant (#356)", async () => {
  const { resolved } = await resolveCrossFileConstant(
    createParseContext({
      "/foo/tokens.ts": `
export const tokens = {
  spacing: {
    inner: {
      s1: "1rem"
    }
  }
};
`,
    }),
    "/foo/bar.ts",
    `padding: --yak-css-import: url("./tokens.ts:tokens:spacing:inner:s1",mixin);`,
  );

  assert.strictEqual(resolved, "padding: 1rem;");
});

test("resolve template literal constant", async () => {
  const { resolved } = await resolveCrossFileConstant(
    createParseContext({
      "/foo/constants.ts": "export const x = `hello`;",
    }),
    "/foo/bar.ts",
    `content: --yak-css-import: url("./constants.ts:x",mixin);`,
  );

  assert.strictEqual(resolved, "content: hello;");
});

test("importYak is false for non-yak files, skipping transform", async () => {
  const getTransformed = vi.fn(() => ({ code: "" }));

  const { resolved } = await resolveCrossFileConstant(
    {
      parse: (modulePath: string) =>
        parseModule(
          {
            extractExports: () => parseExports(`export const x = "red";`),
            getTransformed,
          },
          modulePath,
        ),
      resolve(specifier: string, importer: string) {
        return path.resolve(path.dirname(importer), specifier);
      },
    },
    "/foo/bar.ts",
    `color: --yak-css-import: url("./constants.ts:x",mixin);`,
  );

  assert.strictEqual(resolved, "color: red;");
  expect(getTransformed).not.toHaveBeenCalled();
});

test("resolve styled component with as type cast (#162)", async () => {
  const { resolved } = await resolveCrossFileConstant(
    createParseContext({
      "/foo/icon.tsx": `
import { styled } from "next-yak";
export const Comp = styled.svg\`\` as unknown as any;
`,
    }),
    "/foo/bar.tsx",
    `--yak-css-import: url("./icon.tsx:Comp",selector) {}`,
  );

  // The resolver produces "undefined" for unresolved-tag selectors
  // (tag-template exports without a matching styled component comment)
  assert.strictEqual(resolved, "undefined {}");
});

// ---------------------------------------------------------------------------
// Error path tests (keep mocked — these test resolution logic, not parsing)
// ---------------------------------------------------------------------------

test("Error: resolving path not existing in record", async () => {
  const parsed: Record<string, ParsedModule> = {
    "/foo/colors.js": {
      path: "/foo/colors.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          colors: {
            type: "record",
            value: {
              blue: {
                type: "record",
                value: {
                  "800": { type: "constant", value: "red" },
                },
              },
            },
          },
        },
        all: [],
      },
    },
  };

  await expect(() =>
    resolveCrossFileConstant(
      {
        parse(modulePath) {
          return parsed[modulePath];
        },
        resolve(specifier, importer) {
          return path.resolve(path.dirname(importer), specifier);
        },
      },
      "/foo/bar.js",
      `color: --yak-css-import: url("./colors.js:colors:red:800",mixin);`,
    ),
  ).rejects
    .toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
  Caused by: Unable to resolve "colors.red.800" in module "/foo/colors.js"
  Caused by: Unable to resolve "red.800" in object/array "colors"
  Caused by: path not found`);
});

test("Error: resolving past the export all limit", async () => {
  const parsed: Record<string, ParsedModule> = {
    "/foo/proxy.js": {
      path: "/foo/proxy.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {},
        all: ["/foo/zindex.js", "/foo/colors.js"],
      },
    },
    "/foo/colors.js": {
      path: "/foo/colors.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          RED_500: { type: "constant", value: "red" },
        },
        all: [],
      },
    },
    "/foo/zindex.js": {
      path: "/foo/zindex.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          OVER: { type: "constant", value: "1" },
          HEADER: { type: "constant", value: "50" },
          MODAL: { type: "constant", value: "100" },
        },
        all: [],
      },
    },
  };

  await expect(() =>
    resolveCrossFileConstant(
      {
        exportAllLimit: 1,
        parse(modulePath) {
          return parsed[modulePath];
        },
        resolve(specifier, importer) {
          return path.resolve(path.dirname(importer), specifier);
        },
      },
      "/foo/bar.js",
      `color: --yak-css-import: url("./proxy.js:RED_500",mixin);`,
    ),
  ).rejects.toThrow(`Unable to resolve "RED_500" in module "/foo/proxy.js"
  Caused by: More than 1 star exports are not supported for performance reasons`);
});

test("Error: resolving non styled-component as a selector", async () => {
  const parsed: Record<string, ParsedModule> = {
    "/foo/components.js": {
      path: "/foo/components.js",
      type: "regular",
      mixins: {
        Main: { type: "mixin", value: "", nameParts: ["Main"] },
      },
      exports: {
        importYak: false,
        named: {
          Main: { type: "tag-template" },
        },
        all: [],
      },
    },
  };

  await expect(() =>
    resolveCrossFileConstant(
      {
        parse(modulePath) {
          return parsed[modulePath];
        },
        resolve(specifier, importer) {
          return path.resolve(path.dirname(importer), specifier);
        },
      },
      "/foo/bar.js",
      `--yak-css-import: url("./components.js:Main",selector) {}`,
    ),
  ).rejects
    .toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
  Caused by: Found "mixin" but expected a selector - did you forget a semicolon after "Main"?`);
});

test("Error: mismatching types between mixin and record export", async () => {
  const parsed: Record<string, ParsedModule> = {
    "/foo/components.js": {
      path: "/foo/components.js",
      type: "regular",
      mixins: {
        "foo.bar": { type: "mixin", value: "", nameParts: ["foo", "bar"] },
      },
      exports: {
        importYak: false,
        named: {
          foo: { type: "constant", value: 1 },
        },
        all: [],
      },
    },
  };

  await expect(() =>
    resolveCrossFileConstant(
      {
        parse(modulePath) {
          return parsed[modulePath];
        },
        resolve(specifier, importer) {
          return path.resolve(path.dirname(importer), specifier);
        },
      },
      "/foo/bar.js",
      `--yak-css-import: url("./components.js:foo:bar",selector) {}`,
    ),
  ).rejects
    .toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
  Caused by: Error parsing file "/foo/components.js"
  Caused by: "foo" is not a record`);
});

test("Error: mismatching types between mixin and nested record export", async () => {
  const parsed: Record<string, ParsedModule> = {
    "/foo/components.js": {
      path: "/foo/components.js",
      type: "regular",
      mixins: {
        "foo.bar.baz": {
          type: "mixin",
          value: "",
          nameParts: ["foo", "bar", "baz"],
        },
      },
      exports: {
        importYak: false,
        named: {
          foo: {
            type: "record",
            value: { bar: { type: "constant", value: 1 } },
          },
        },
        all: [],
      },
    },
  };

  await expect(() =>
    resolveCrossFileConstant(
      {
        parse(modulePath) {
          return parsed[modulePath];
        },
        resolve(specifier, importer) {
          return path.resolve(path.dirname(importer), specifier);
        },
      },
      "/foo/bar.js",
      `--yak-css-import: url("./components.js:foo:bar",selector) {}`,
    ),
  ).rejects
    .toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
  Caused by: Error parsing file "/foo/components.js"
  Caused by: "foo.bar" is not a record`);
});

test("Error: mismatching types between styled-component and record export", async () => {
  const parsed: Record<string, ParsedModule> = {
    "/foo/components.js": {
      path: "/foo/components.js",
      type: "regular",
      styledComponents: {
        "foo.bar": {
          type: "styled-component",
          value: "className",
          nameParts: ["foo", "bar"],
        },
      },
      exports: {
        importYak: false,
        named: {
          foo: { type: "constant", value: 1 },
        },
        all: [],
      },
    },
  };

  await expect(() =>
    resolveCrossFileConstant(
      {
        parse(modulePath) {
          return parsed[modulePath];
        },
        resolve(specifier, importer) {
          return path.resolve(path.dirname(importer), specifier);
        },
      },
      "/foo/bar.js",
      `--yak-css-import: url("./components.js:foo:bar",selector) {}`,
    ),
  ).rejects
    .toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
  Caused by: Error parsing file "/foo/components.js"
  Caused by: "foo" is not a record`);
});

test("Error: mismatching types between styled-component and nested record export", async () => {
  const parsed: Record<string, ParsedModule> = {
    "/foo/components.js": {
      path: "/foo/components.js",
      type: "regular",
      styledComponents: {
        "foo.bar.baz": {
          type: "styled-component",
          value: "className",
          nameParts: ["foo", "bar", "baz"],
        },
      },
      exports: {
        importYak: false,
        named: {
          foo: {
            type: "record",
            value: { bar: { type: "constant", value: 1 } },
          },
        },
        all: [],
      },
    },
  };

  await expect(() =>
    resolveCrossFileConstant(
      {
        parse(modulePath) {
          return parsed[modulePath];
        },
        resolve(specifier, importer) {
          return path.resolve(path.dirname(importer), specifier);
        },
      },
      "/foo/bar.js",
      `--yak-css-import: url("./components.js:foo:bar",selector) {}`,
    ),
  ).rejects
    .toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
  Caused by: Error parsing file "/foo/components.js"
  Caused by: "foo.bar" is not a record`);
});

test("Error: resolving non existing export", async () => {
  const parsed: Record<string, ParsedModule> = {
    "/foo/components.js": {
      path: "/foo/components.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          bar: { type: "constant", value: 1 },
        },
        all: [],
      },
    },
  };

  await expect(() =>
    resolveCrossFileConstant(
      {
        parse(modulePath) {
          return parsed[modulePath];
        },
        resolve(specifier, importer) {
          return path.resolve(path.dirname(importer), specifier);
        },
      },
      "/foo/bar.js",
      `--yak-css-import: url("./components.js:foo:bar",selector) {}`,
    ),
  ).rejects
    .toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
  Caused by: Unable to resolve "foo.bar"
  Caused by: no matching export found in module "/foo/components.js"`);
});

test("Error: specifier path in record ends with a record", async () => {
  const parsed: Record<string, ParsedModule> = {
    "/foo/components.js": {
      path: "/foo/components.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          foo: {
            type: "record",
            value: { bar: { type: "constant", value: 1 } },
          },
        },
        all: [],
      },
    },
  };

  await expect(() =>
    resolveCrossFileConstant(
      {
        parse(modulePath) {
          return parsed[modulePath];
        },
        resolve(specifier, importer) {
          return path.resolve(path.dirname(importer), specifier);
        },
      },
      "/foo/bar.js",
      `--yak-css-import: url("./components.js:foo",selector) {}`,
    ),
  ).rejects
    .toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
  Caused by: Unable to resolve "foo" in module "/foo/components.js"
  Caused by: did not expect an object`);
});

test("Error: specifier path in record does not resolve in constant, mixin or styled-component", async () => {
  const parsed: Record<string, ParsedModule> = {
    "/foo/components.js": {
      path: "/foo/components.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          foo: {
            type: "record",
            value: {
              bar: {
                type: "record",
                value: { baz: { type: "constant", value: 1 } },
              },
            },
          },
        },
        all: [],
      },
    },
  };

  await expect(() =>
    resolveCrossFileConstant(
      {
        parse(modulePath) {
          return parsed[modulePath];
        },
        resolve(specifier, importer) {
          return path.resolve(path.dirname(importer), specifier);
        },
      },
      "/foo/bar.js",
      `--yak-css-import: url("./components.js:foo:bar",selector) {}`,
    ),
  ).rejects
    .toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
  Caused by: Unable to resolve "foo.bar" in module "/foo/components.js"
  Caused by: Unable to resolve "bar" in object/array "foo"
  Caused by: only string and numbers are supported`);
});

test("Error: Resolve with circular dependency", async () => {
  const parsed: Record<string, ParsedModule> = {
    "/foo/a.js": {
      path: "/foo/a.js",
      type: "regular",
      exports: {
        importYak: false,
        named: { a: { type: "re-export", name: "b", from: "/foo/b.js" } },
        all: [],
      },
    },
    "/foo/b.js": {
      path: "/foo/b.js",
      type: "regular",
      exports: {
        importYak: false,
        named: { b: { type: "re-export", name: "c", from: "/foo/c.js" } },
        all: [],
      },
    },
    "/foo/c.js": {
      path: "/foo/c.js",
      type: "regular",
      exports: {
        importYak: false,
        named: { c: { type: "re-export", name: "d", from: "/foo/d.js" } },
        all: [],
      },
    },
    "/foo/d.js": {
      path: "/foo/d.js",
      type: "regular",
      exports: {
        importYak: false,
        named: { d: { type: "re-export", name: "b", from: "/foo/b.js" } },
        all: [],
      },
    },
  };

  await expect(() =>
    resolveCrossFileConstant(
      {
        parse(modulePath) {
          return parsed[modulePath];
        },
        resolve(specifier, importer) {
          return path.resolve(path.dirname(importer), specifier);
        },
      },
      "/foo/bar.js",
      `--yak-css-import: url("./a.js:a",selector) {}`,
    ),
  ).rejects
    .toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
  Caused by: Unable to resolve "a" in module "/foo/a.js"
  Caused by: Unable to resolve "b" in module "/foo/b.js"
  Caused by: Unable to resolve "c" in module "/foo/c.js"
  Caused by: Unable to resolve "d" in module "/foo/d.js"
  Caused by: Unable to resolve "b" in module "/foo/b.js"
  Caused by: Circular dependency detected`);
});

test("Error: Resolve with circular dependency with star exports", async () => {
  const parsed: Record<string, ParsedModule> = {
    "/foo/a.js": {
      path: "/foo/a.js",
      type: "regular",
      exports: {
        importYak: false,
        named: { a: { type: "re-export", name: "b", from: "/foo/b.js" } },
        all: [],
      },
    },
    "/foo/b.js": {
      path: "/foo/b.js",
      type: "regular",
      exports: {
        importYak: false,
        named: { b: { type: "re-export", name: "d", from: "/foo/c.js" } },
        all: [],
      },
    },
    "/foo/c.js": {
      path: "/foo/c.js",
      type: "regular",
      exports: { importYak: false, named: {}, all: ["/foo/d.js"] },
    },
    "/foo/d.js": {
      path: "/foo/d.js",
      type: "regular",
      exports: {
        importYak: false,
        named: { d: { type: "re-export", name: "b", from: "/foo/b.js" } },
        all: [],
      },
    },
  };

  await expect(() =>
    resolveCrossFileConstant(
      {
        parse(modulePath) {
          return parsed[modulePath];
        },
        resolve(specifier, importer) {
          return path.resolve(path.dirname(importer), specifier);
        },
      },
      "/foo/bar.js",
      `--yak-css-import: url("./a.js:a",selector) {}`,
    ),
  ).rejects
    .toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
  Caused by: Unable to resolve "a" in module "/foo/a.js"
  Caused by: Unable to resolve "b" in module "/foo/b.js"
  Caused by: Unable to resolve "d" in module "/foo/c.js"
  Caused by: Unable to resolve "d" in module "/foo/d.js"
  Caused by: Unable to resolve "b" in module "/foo/b.js"
  Caused by: Circular dependency detected`);
});

test("Do not mistake loopback with circular dependency", async () => {
  const parsed: Record<string, ParsedModule> = {
    "/foo/a.js": {
      path: "/foo/a.js",
      type: "regular",
      exports: {
        importYak: false,
        named: { a: { type: "re-export", name: "b", from: "/foo/b.js" } },
        all: [],
      },
    },
    "/foo/b.js": {
      path: "/foo/b.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          b: { type: "re-export", name: "c", from: "/foo/c.js" },
          foo: { type: "constant", value: "red" },
        },
        all: [],
      },
    },
    "/foo/c.js": {
      path: "/foo/c.js",
      type: "regular",
      exports: {
        importYak: false,
        named: { c: { type: "re-export", name: "d", from: "/foo/d.js" } },
        all: [],
      },
    },
    "/foo/d.js": {
      path: "/foo/d.js",
      type: "regular",
      exports: {
        importYak: false,
        named: { d: { type: "re-export", name: "foo", from: "/foo/b.js" } },
        all: [],
      },
    },
  };

  const { resolved, dependencies } = await resolveCrossFileConstant(
    {
      parse(modulePath) {
        return parsed[modulePath];
      },
      resolve(specifier, importer) {
        return path.resolve(path.dirname(importer), specifier);
      },
    },
    "/foo/bar.js",
    `color: --yak-css-import: url("./a.js:a",mixin);`,
  );

  assert.strictEqual(resolved, "color: red;");
  expect(dependencies).to.have.members([
    "/foo/a.js",
    "/foo/b.js",
    "/foo/c.js",
    "/foo/d.js",
  ]);
});

test("Error: unsupported export from a regular .ts file shows a Rust-style snippet", async () => {
  await expect(() =>
    resolveCrossFileConstant(
      createParseContext({
        "/foo/colors.ts":
          "const v = '--bg';\nexport const bg = `var(${v})`;",
      }),
      "/foo/bar.ts",
      `--yak-css-import: url("./colors.ts:bg",selector) {}`,
    ),
  ).rejects
    .toThrow(`Error while resolving cross-file selectors in file "/foo/bar.ts"
  Caused by: Unable to resolve "bg" in module "/foo/colors.ts"
  Caused by: \`bg\` is not a string or number literal (got a TemplateLiteral).
   --> /foo/colors.ts:2:19
      |
    2 | export const bg = \`var(\${v})\`;
      |                   ^^^^^^^^^^^ TemplateLiteral
  help: rename "/foo/colors.ts" to "/foo/colors.yak.ts" so its exports run at build time
        (or replace \`bg\` with a literal value)
  see:  https://yak.js.org/docs/migration-from-styled-components#move-some-code-to-yak-files`);
});

test("Error: unsupported value from an evaluated .yak.ts file explains supported types", async () => {
  await expect(() =>
    resolveCrossFileConstant(
      {
        parse: (modulePath: string) =>
          parseModule(
            {
              extractExports: () => ({
                importYak: false,
                named: {},
                all: [],
              }),
              getTransformed: () => ({ code: "" }),
              evaluateYakModule: async () => ({ flag: true }),
            },
            modulePath,
          ),
        resolve(specifier: string, importer: string) {
          return path.resolve(path.dirname(importer), specifier);
        },
      },
      "/foo/bar.ts",
      `--yak-css-import: url("./tokens.yak.ts:flag",selector) {}`,
    ),
  ).rejects
    .toThrow(`Error while resolving cross-file selectors in file "/foo/bar.ts"
  Caused by: Unable to resolve "flag" in module "/foo/tokens.yak.ts"
  Caused by: \`flag\` evaluated to a value that cannot be inlined into CSS (got \`true\`).
  help: replace it with a string, number, or plain object/array of those
  see:  https://yak.js.org/docs/migration-from-styled-components#move-some-code-to-yak-files`);
});
