import * as path from "node:path";
import { assert, expect, test, vi } from "vitest";
import { parseExports } from "../../loaders/lib/resolveCrossFileSelectors.js";
import { ParsedModule, parseModule } from "../parseModule.js";
import { resolveCrossFileConstant } from "../resolveCrossFileConstant.js";

/**
 * Creates a resolve context that wires real source strings through
 * parseExports → parseModule → resolveCrossFileConstant.
 */
function createParseContext(
  files: Record<string, string>,
  transformedFiles: Record<string, string> = {},
) {
  return {
    parse: (modulePath: string) =>
      parseModule(
        {
          extractExports: (p: string) => parseExports(files[p]),
          getTransformed: (p: string) => ({ code: transformedFiles[p] ?? "" }),
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
        assert.fail("no file should be parsed for css with no cross-file constant");
      },
      resolve() {
        assert.fail("no file should be resolved for css with no cross-file constant");
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
      "/foo/proxy.ts": [`export * from "./zindex.ts";`, `export * from "./colors.ts";`].join("\n"),
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
  ).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
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
  ).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
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
  ).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
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
  ).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
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
  ).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
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
  ).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
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
  ).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
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
  ).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
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
  ).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
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
  ).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
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
  ).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
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
  expect(dependencies).to.have.members(["/foo/a.js", "/foo/b.js", "/foo/c.js", "/foo/d.js"]);
});

test("Error: unsupported export from a regular .ts file shows a Rust-style snippet", async () => {
  await expect(() =>
    resolveCrossFileConstant(
      createParseContext({
        "/foo/colors.ts": "const v = '--bg';\nexport const bg = `var(${v})`;",
      }),
      "/foo/bar.ts",
      `--yak-css-import: url("./colors.ts:bg",selector) {}`,
    ),
  ).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.ts"
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
  ).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.ts"
  Caused by: Unable to resolve "flag" in module "/foo/tokens.yak.ts"
  Caused by: \`flag\` evaluated to a value that cannot be inlined into CSS (got \`true\`).
  help: replace it with a string, number, or plain object/array of those
  see:  https://yak.js.org/docs/migration-from-styled-components#move-some-code-to-yak-files`);
});

test("resolve dynamic cross-file mixin (V2) - splices static css and hoists branch rules", async () => {
  // Producer source as written by the user
  const producerSource = `
import { css } from "next-yak";
export const highlight = css\`
  color: black;
  \${({ $active }) => $active && css\`color: red;\`}
\`;
`;
  // Producer as compiled by yak-swc (V2 payload + __yak_mixin template)
  const producerTransformed = `
import { css, __yak_mixin } from "next-yak/internal";
export const highlight = /*YAK EXPORTED MIXIN V2:highlight
color: black;
@yak-branch b0 {
  color: red;
}
*/ /*#__PURE__*/ __yak_mixin((__yak_b)=>[
        ({ $active })=>$active && /*#__PURE__*/ css(__yak_b(0))
    ]);
`;
  // Consumer css as extracted by yak-swc
  const consumerCss = [
    ":global(.Button_x) {",
    "  padding: 10px;",
    '  --yak-css-import: url("./highlight.ts:highlight",mixin,"Button__highlight_x");',
    "  color: green;",
    "}",
  ].join("\n");

  const { resolved, dependencies } = await resolveCrossFileConstant(
    createParseContext(
      { "/foo/highlight.ts": producerSource },
      { "/foo/highlight.ts": producerTransformed },
    ),
    "/foo/bar.ts",
    consumerCss,
  );

  expect(resolved).toMatchInlineSnapshot(`
    ":global(.Button_x) {
      padding: 10px;
      color: black;
    }
    :global(.Button__highlight_x-b0) {
    color: red;
    }
    :global(.Button_x) {
      color: green;
    }"
  `);
  expect(dependencies).to.have.members(["/foo/highlight.ts"]);
});

test("resolve dynamic cross-file mixin (V2) - rejects markers without a scope prefix", async () => {
  const producerTransformed = `
export const highlight = /*YAK EXPORTED MIXIN V2:highlight
@yak-branch b0 {
  color: red;
}
*/ __yak_mixin((__yak_b)=>[]);
`;
  await expect(() =>
    resolveCrossFileConstant(
      createParseContext(
        { "/foo/highlight.ts": `import { css } from "next-yak";\nexport const highlight = css\`\`;` },
        { "/foo/highlight.ts": producerTransformed },
      ),
      "/foo/bar.ts",
      `:global(.Button_x) {\n  --yak-css-import: url("./highlight.ts:highlight",mixin);\n}`,
    ),
  ).rejects.toThrow("can only be used as a top level statement");
});

test("resolve dynamic mixin used inside another exported mixin (slot scoping, two hops)", async () => {
  const innerSource = `
import { css } from "next-yak";
export const inner = css\`
  color: black;
  \${({ $a }) => $a && css\`color: red;\`}
\`;
`;
  const innerTransformed = `
import { css, __yak_mixin } from "next-yak/internal";
export const inner = /*YAK EXPORTED MIXIN V2:inner
color: black;
@yak-branch b0 {
  color: red;
}
*/ __yak_mixin((__yak_b)=>[
        ({ $a })=>$a && css(__yak_b(0))
    ]);
`;
  const outerSource = `
import { css } from "next-yak";
import { inner } from "./inner.ts";
export const outer = css\`
  font-size: 16px;
  \${inner};
  \${({ $b }) => $b && css\`border: 1px solid;\`}
\`;
`;
  const outerTransformed = `
import { css, __yak_use, __yak_mixin } from "next-yak/internal";
import { inner } from "./inner.ts";
export const outer = /*YAK EXPORTED MIXIN V2:outer
font-size: 16px;
--yak-css-import: url("./inner.ts:inner",mixin,@s0);
@yak-branch b0 {
  border: 1px solid;
}
*/ __yak_mixin((__yak_b)=>[
        __yak_use(inner, __yak_b.sub(0)),
        ({ $b })=>$b && css(__yak_b(0))
    ]);
`;
  const consumerCss = [
    ":global(.Card_x) {",
    "  padding: 4px;",
    '  --yak-css-import: url("./outer.ts:outer",mixin,"Card__outer_x");',
    "  color: green;",
    "}",
  ].join("\n");

  const { resolved, dependencies } = await resolveCrossFileConstant(
    createParseContext(
      { "/foo/inner.ts": innerSource, "/foo/outer.ts": outerSource },
      { "/foo/inner.ts": innerTransformed, "/foo/outer.ts": outerTransformed },
    ),
    "/foo/bar.ts",
    consumerCss,
  );

  expect(resolved).toMatchInlineSnapshot(`
    ":global(.Card_x) {
      padding: 4px;
      font-size: 16px;
    color: black;
    }
    :global(.Card__outer_x-s0-b0) {
    color: red;
    }
    :global(.Card_x) {
    }
    :global(.Card__outer_x-b0) {
    border: 1px solid;
    }
    :global(.Card_x) {
      color: green;
    }"
  `);
  expect(dependencies).to.have.members(["/foo/inner.ts", "/foo/outer.ts"]);
});

test("resolve dynamic mixin with nested branches and nesting context inside a branch", async () => {
  // payload taken from the cross-file-mixin-dynamic-nested-branches fixture
  const producerTransformed = `
import { css, __yak_mixin } from "next-yak/internal";
export const fancy = /*YAK EXPORTED MIXIN V2:fancy
color: black;
@yak-branch b0 {
  color: red;
  &:hover {
    color: darkred;
  }
}
@yak-branch b1 {
  color: blue;
}
*/ __yak_mixin((__yak_b)=>[
        ({ $a })=>$a && css(__yak_b(0), ({ $b })=>$b && css(__yak_b(1)))
    ]);
`;
  const consumerCss = [
    ":global(.Button_x) {",
    "  &:focus {",
    '    --yak-css-import: url("./fancy.ts:fancy",mixin,"Button__fancy_x");',
    "  }",
    "}",
  ].join("\n");

  const { resolved } = await resolveCrossFileConstant(
    createParseContext(
      { "/foo/fancy.ts": `import { css } from "next-yak";\nexport const fancy = css\`\`;` },
      { "/foo/fancy.ts": producerTransformed },
    ),
    "/foo/bar.ts",
    consumerCss,
  );

  expect(resolved).toMatchInlineSnapshot(`
    ":global(.Button_x) {
      &:focus {
        color: black;
    }
    }
    :global(.Button__fancy_x-b0) {
    &:focus {
    color: red;
      &:hover {
        color: darkred;
      }
    }
    }
    :global(.Button_x) {
    &:focus {
    }
    }
    :global(.Button__fancy_x-b1) {
    &:focus {
    color: blue;
    }
    }
    :global(.Button_x) {
    &:focus {
      }
    }"
  `);
});

test("resolve dynamic mixin with css variables (values stay producer scoped)", async () => {
  // payload taken from the cross-file-mixin-dynamic-vars fixture
  const producerTransformed = `
import { css, __yak_unitPostFix, __yak_mixin } from "next-yak/internal";
export const pad = /*YAK EXPORTED MIXIN V2:pad
padding: var(--input_pad__padding_x);
margin: 0;
*/ __yak_mixin((__yak_b)=>[
        { "style": { "--input_pad__padding_x": __yak_unitPostFix(({ $pad })=>$pad, "px") } }
    ]);
`;
  const consumerCss = [
    ":global(.Box_x) {",
    '  --yak-css-import: url("./pad.ts:pad",mixin,"Box__pad_x");',
    "}",
  ].join("\n");

  const { resolved } = await resolveCrossFileConstant(
    createParseContext(
      { "/foo/pad.ts": `import { css } from "next-yak";\nexport const pad = css\`\`;` },
      { "/foo/pad.ts": producerTransformed },
    ),
    "/foo/bar.ts",
    consumerCss,
  );

  // no branches: the payload is spliced in place like a static mixin
  expect(resolved).toMatchInlineSnapshot(`
    ":global(.Box_x) {
      padding: var(--input_pad__padding_x);
    margin: 0;
    }"
  `);
});

test("slot markers inside exported mixins resolve relative to the exporting file", async () => {
  // helper/outer.ts references ../inner.ts - the consumer lives next to
  // inner.ts, so resolving the deferred marker against the consumer's
  // directory would produce a wrong path (e2e regression: nested-mixin)
  const innerSource = `
import { css } from "next-yak";
export const inner = css\`color: black;\`;
`;
  const innerTransformed = `
export const inner = /*YAK EXPORTED MIXIN:inner
color: black;
*/ css();
`;
  const outerSource = `
import { css } from "next-yak";
import { inner } from "../inner.ts";
export const outer = css\`
  \${inner};
  color: green;
\`;
`;
  const outerTransformed = `
import { css, __yak_use, __yak_mixin } from "next-yak/internal";
import { inner } from "../inner.ts";
export const outer = /*YAK EXPORTED MIXIN V2:outer
--yak-css-import: url("../inner.ts:inner",mixin,@s0);
color: green;
*/ __yak_mixin((__yak_b)=>[
        __yak_use(inner, __yak_b.sub(0))
    ]);
`;
  const consumerCss = [
    ":global(.Button_x) {",
    '  --yak-css-import: url("./helper/outer.ts:outer",mixin,"Button__outer_x");',
    "}",
  ].join("\n");

  const { resolved, dependencies } = await resolveCrossFileConstant(
    createParseContext(
      { "/foo/inner.ts": innerSource, "/foo/helper/outer.ts": outerSource },
      { "/foo/inner.ts": innerTransformed, "/foo/helper/outer.ts": outerTransformed },
    ),
    "/foo/bar.ts",
    consumerCss,
  );

  expect(resolved).toMatchInlineSnapshot(`
    ":global(.Button_x) {
      color: black;

    color: green;
    }"
  `);
  expect(dependencies).to.have.members(["/foo/inner.ts", "/foo/helper/outer.ts"]);
});
