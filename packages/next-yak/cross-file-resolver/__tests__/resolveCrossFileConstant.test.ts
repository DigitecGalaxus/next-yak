import { test, assert, expect, vi } from "vitest"
import { resolveCrossFileConstant } from "../resolveCrossFileConstant.js"
import { ParsedModule } from "../parseModule.js"
import * as path from "node:path"

test("resolve css with no cross-file constant", async () => {
  const css = "color:red"
  const { resolved, dependencies } = await resolveCrossFileConstant({
    parse() {
      assert.fail('no file should be parsed for css with no cross-file constant')
    },
    resolve() {
      assert.fail('no file should be resolved for css with no cross-file constant')

    }
  }, "foo/bar.js", "color:red")

  assert.strictEqual(resolved, css)
  assert.strictEqual(dependencies.length, 0)
})

test("resolve css with cross-file constant from 1 depth named import", async () => {
  const css = `color: --yak-css-import: url("./constant.js:color",mixin);`

  const parsed: Record<string, ParsedModule> = {
    "/foo/constant.js": {
      path: "/foo/constant.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          color: { type: "constant", value: "red" }
        },
        all: []
      }
    }
  }

  const { resolved, dependencies } = await resolveCrossFileConstant({
    parse(modulePath) {
      return parsed[modulePath]
    },
    resolve(specifier, importer) {
      return path.resolve(path.dirname(importer), specifier)
    }
  }, "/foo/bar.js", css)

  assert.strictEqual(resolved, "color: red;")
  assert.deepEqual(dependencies, ['/foo/constant.js'])
})

test("resolve css with cross-file constant from 2 depth named import", async () => {
  const css = `color: --yak-css-import: url("./proxy.js:primaryColor",mixin);`

  const parsed: Record<string, ParsedModule> = {
    "/foo/proxy.js": {
      path: "/foo/proxy.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          primaryColor: { type:"re-export", name:"RED_500", from:"/foo/constant.js" }
        },
        all: [],
      }
    },
    "/foo/constant.js": {
      path: "/foo/constant.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          RED_500: { type: "constant", value: "red" }
        },
        all: []
      }
    }
  }

  const { resolved, dependencies } = await resolveCrossFileConstant({
    parse(modulePath) {
      return parsed[modulePath]
    },
    resolve(specifier, importer) {
      return path.resolve(path.dirname(importer), specifier)
    }
  }, "/foo/bar.js", css)

  assert.strictEqual(resolved, "color: red;")
  expect(dependencies).to.have.members(['/foo/constant.js', '/foo/proxy.js'])
})

test("resolve css with cross-file constant from namespace re-export", async () => {
  const css = `color: --yak-css-import: url("./proxy.js:colors:RED_500",mixin);`

  const parsed: Record<string, ParsedModule> = {
    "/foo/proxy.js": {
      path: "/foo/proxy.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          colors: { type:"namespace-re-export", from:"/foo/constant.js" }
        },
        all: [],
      }
    },
    "/foo/constant.js": {
      path: "/foo/constant.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          RED_500: { type: "constant", value: "red" }
        },
        all: []
      }
    }
  }

  const { resolved, dependencies } = await resolveCrossFileConstant({
    parse(modulePath) {
      return parsed[modulePath]
    },
    resolve(specifier, importer) {
      return path.resolve(path.dirname(importer), specifier)
    }
  }, "/foo/bar.js", css)

  assert.strictEqual(resolved, "color: red;")
  expect(dependencies).to.have.members(['/foo/constant.js', '/foo/proxy.js'])
})

test("resolve css with cross-file constant from star export", async () => {
  const css = `color: --yak-css-import: url("./proxy.js:RED_500",mixin);`

  const parsed: Record<string, ParsedModule> = {
    "/foo/proxy.js": {
      path: "/foo/proxy.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {},
        all: ["/foo/zindex.js", "/foo/colors.js"],
      }
    },
    "/foo/colors.js": {
      path: "/foo/colors.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          RED_500: { type: "constant", value: "red" }
        },
        all: []
      }
    },
    "/foo/zindex.js": {
      path: "/foo/zindex.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          OVER: { type: "constant", value: "1" },
          HEADER: { type: "constant", value: "50" },
          MODAL: { type: "constant", value: "100" }
        },
        all: []
      }
    }
  }

  const { resolved, dependencies } = await resolveCrossFileConstant({
    parse(modulePath) {
      return parsed[modulePath]
    },
    resolve(specifier, importer) {
      return path.resolve(path.dirname(importer), specifier)
    }
  }, "/foo/bar.js", css)

  assert.strictEqual(resolved, "color: red;")
  expect(dependencies).to.have.members(['/foo/proxy.js', '/foo/colors.js'])
})

test("resolve css with cross-file constant from deep object", async () => {
  const css = `color: --yak-css-import: url("./colors.js:colors:RED_500",mixin);`

  const parsed: Record<string, ParsedModule> = {
    "/foo/colors.js": {
      path: "/foo/colors.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          "colors": { type:"record", value: {
            RED_500: { type:"constant", value:"red" }
          }}
        },
        all: [],
      }
    },
  }

  const { resolved, dependencies } = await resolveCrossFileConstant({
    parse(modulePath) {
      return parsed[modulePath]
    },
    resolve(specifier, importer) {
      return path.resolve(path.dirname(importer), specifier)
    }
  }, "/foo/bar.js", css)

  assert.strictEqual(resolved, "color: red;")
  expect(dependencies).to.have.members(['/foo/colors.js'])

})

test("Error: resolving path not existing in record", async () => {
  const css = `color: --yak-css-import: url("./colors.js:colors:red:800",mixin);`

  const parsed: Record<string, ParsedModule> = {
    "/foo/colors.js": {
      path: "/foo/colors.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          "colors": { 
            type:"record", 
            value: {
              blue: { 
                type:"record", 
                value: {
                  "800": { type:"constant", value:"red" }
                }
              }
            }
          }
        },
        all: [],
      }
    },
  }

  await expect(() => resolveCrossFileConstant({
    parse(modulePath) {
      return parsed[modulePath]
    },
    resolve(specifier, importer) {
      return path.resolve(path.dirname(importer), specifier)
    }
  }, "/foo/bar.js", css)).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
  Caused by: Unable to resolve "colors.red.800" in module "/foo/colors.js"
  Caused by: Unable to resolve "red.800" in object/array "colors"
  Caused by: path not found`)
})

test("Error: resolving past the export all limit", async () => {
  const css = `color: --yak-css-import: url("./proxy.js:RED_500",mixin);`

  const parsed: Record<string, ParsedModule> = {
    "/foo/proxy.js": {
      path: "/foo/proxy.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {},
        all: ["/foo/zindex.js", "/foo/colors.js"],
      }
    },
    "/foo/colors.js": {
      path: "/foo/colors.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          RED_500: { type: "constant", value: "red" }
        },
        all: []
      }
    },
    "/foo/zindex.js": {
      path: "/foo/zindex.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          OVER: { type: "constant", value: "1" },
          HEADER: { type: "constant", value: "50" },
          MODAL: { type: "constant", value: "100" }
        },
        all: []
      }
    }
  }

  await expect(() => resolveCrossFileConstant({
    exportAllLimit: 1,
    parse(modulePath) {
      return parsed[modulePath]
    },
    resolve(specifier, importer) {
      return path.resolve(path.dirname(importer), specifier)
    }
  }, "/foo/bar.js", css)).rejects.toThrow(`Unable to resolve "RED_500" in module "/foo/proxy.js"
  Caused by: More than 1 star exports are not supported for performance reasons`)
})

test("Error: resolving non styled-component as a selector", async () => {
  const css = `--yak-css-import: url("./components.js:Main",selector) {}`

  const parsed: Record<string, ParsedModule> = {
    "/foo/components.js": {
      path: "/foo/components.js",
      type: "regular",
      mixins: {
        "Main": { type:"mixin", value:"", nameParts:['Main'] }
      },
      exports: {
        importYak: false,
        named: {
          "Main": { type:"tag-template" }
        },
        all: [],
      }
    },
  }

  await expect(() => resolveCrossFileConstant({
    parse(modulePath) {
      return parsed[modulePath]
    },
    resolve(specifier, importer) {
      return path.resolve(path.dirname(importer), specifier)
    }
  }, "/foo/bar.js", css)).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
  Caused by: Found "mixin" but expected a selector - did you forget a semicolon after "Main"?`)
})

test("Error: mismatching types between mixin and record export", async () => {
  const css = `--yak-css-import: url("./components.js:foo:bar",selector) {}`

  const parsed: Record<string, ParsedModule> = {
    "/foo/components.js": {
      path: "/foo/components.js",
      type: "regular",
      mixins: {
        "foo.bar": { type:"mixin", value:"", nameParts:['foo', 'bar'] }
      },
      exports: {
        importYak: false,
        named: {
          "foo": { type:"constant", value:1 }
        },
        all: [],
      }
    },
  }

  await expect(() => resolveCrossFileConstant({
    parse(modulePath) {
      return parsed[modulePath]
    },
    resolve(specifier, importer) {
      return path.resolve(path.dirname(importer), specifier)
    }
  }, "/foo/bar.js", css)).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
  Caused by: Error parsing file "/foo/components.js"
  Caused by: "foo" is not a record`)
})

test("Error: mismatching types between mixin and nested record export", async () => {
  const css = `--yak-css-import: url("./components.js:foo:bar",selector) {}`

  const parsed: Record<string, ParsedModule> = {
    "/foo/components.js": {
      path: "/foo/components.js",
      type: "regular",
      mixins: {
        "foo.bar.baz": { type:"mixin", value:"", nameParts:['foo', 'bar', 'baz'] }
      },
      exports: {
        importYak: false,
        named: {
          "foo": { type:"record", value: { "bar": { type:"constant", value: 1} } }
        },
        all: [],
      }
    },
  }

  await expect(() => resolveCrossFileConstant({
    parse(modulePath) {
      return parsed[modulePath]
    },
    resolve(specifier, importer) {
      return path.resolve(path.dirname(importer), specifier)
    }
  }, "/foo/bar.js", css)).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
  Caused by: Error parsing file "/foo/components.js"
  Caused by: "foo.bar" is not a record`)
})

test("Error: mismatching types between styled-component and record export", async () => {
  const css = `--yak-css-import: url("./components.js:foo:bar",selector) {}`

  const parsed: Record<string, ParsedModule> = {
    "/foo/components.js": {
      path: "/foo/components.js",
      type: "regular",
      styledComponents: {
        "foo.bar": { type:"styled-component", value:"className", nameParts:['foo', 'bar'] }
      },
      exports: {
        importYak: false,
        named: {
          "foo": { type:"constant", value:1 }
        },
        all: [],
      }
    },
  }

  await expect(() => resolveCrossFileConstant({
    parse(modulePath) {
      return parsed[modulePath]
    },
    resolve(specifier, importer) {
      return path.resolve(path.dirname(importer), specifier)
    }
  }, "/foo/bar.js", css)).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
  Caused by: Error parsing file "/foo/components.js"
  Caused by: "foo" is not a record`)
})

test("Error: mismatching types between styled-component and nested record export", async () => {
  const css = `--yak-css-import: url("./components.js:foo:bar",selector) {}`

  const parsed: Record<string, ParsedModule> = {
    "/foo/components.js": {
      path: "/foo/components.js",
      type: "regular",
      styledComponents: {
        "foo.bar.baz": { type:"styled-component", value:"className", nameParts:['foo', 'bar', 'baz'] }
      },
      exports: {
        importYak: false,
        named: {
          "foo": { type:"record", value: { "bar": { type:"constant", value: 1} } }
        },
        all: [],
      }
    },
  }

  await expect(() => resolveCrossFileConstant({
    parse(modulePath) {
      return parsed[modulePath]
    },
    resolve(specifier, importer) {
      return path.resolve(path.dirname(importer), specifier)
    }
  }, "/foo/bar.js", css)).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
  Caused by: Error parsing file "/foo/components.js"
  Caused by: "foo.bar" is not a record`)
})

test("Error: resolving non existing export", async () => {
  const css = `--yak-css-import: url("./components.js:foo:bar",selector) {}`

  const parsed: Record<string, ParsedModule> = {
    "/foo/components.js": {
      path: "/foo/components.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          "bar": {  type:"constant", value: 1 } 
        },
        all: [],
      }
    },
  }

  await expect(() => resolveCrossFileConstant({
    parse(modulePath) {
      return parsed[modulePath]
    },
    resolve(specifier, importer) {
      return path.resolve(path.dirname(importer), specifier)
    }
  }, "/foo/bar.js", css)).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
  Caused by: Unable to resolve "foo.bar"
  Caused by: no matching export found in module "/foo/components.js"`)
})

test("Error: specifier path in record ends with a record", async () => {
  const css = `--yak-css-import: url("./components.js:foo",selector) {}`

  const parsed: Record<string, ParsedModule> = {
    "/foo/components.js": {
      path: "/foo/components.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          "foo": { type:"record", value:{ "bar": { type:"constant", value: 1 } } }
        },
        all: [],
      }
    },
  }

  await expect(() => resolveCrossFileConstant({
    parse(modulePath) {
      return parsed[modulePath]
    },
    resolve(specifier, importer) {
      return path.resolve(path.dirname(importer), specifier)
    }
  }, "/foo/bar.js", css)).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
  Caused by: Unable to resolve "foo" in module "/foo/components.js"
  Caused by: did not expect an object`)
})

test("Error: specifier path in record does not resolve in constant, mixin or styled-component", async () => {
  const css = `--yak-css-import: url("./components.js:foo:bar",selector) {}`

  const parsed: Record<string, ParsedModule> = {
    "/foo/components.js": {
      path: "/foo/components.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          "foo": { type:"record", value:{ "bar": { type:"record", value: { "baz": { type:"constant", value: 1 } } } } }
        },
        all: [],
      }
    },
  }

  await expect(() => resolveCrossFileConstant({
    parse(modulePath) {
      return parsed[modulePath]
    },
    resolve(specifier, importer) {
      return path.resolve(path.dirname(importer), specifier)
    }
  }, "/foo/bar.js", css)).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
  Caused by: Unable to resolve "foo.bar" in module "/foo/components.js"
  Caused by: Unable to resolve "bar" in object/array "foo"
  Caused by: only string and numbers are supported`)
})

test("Error: Resolve with circular dependency", async () => {
  const css = `--yak-css-import: url("./a.js:a",selector) {}`

  const parsed: Record<string, ParsedModule> = {
    "/foo/a.js": {
      path: "/foo/a.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          "a": { type:"re-export", name:"b", from:"/foo/b.js"},
        },
        all: [],
      }
    },
    "/foo/b.js": {
      path: "/foo/b.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          "b": { type:"re-export", name:"c", from:"/foo/c.js"}
        },
        all: [],
      }
    },
    "/foo/c.js": {
      path: "/foo/c.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          "c": { type:"re-export", name:"d", from:"/foo/d.js"}
        },
        all: [],
      }
    },
    "/foo/d.js": {
      path: "/foo/d.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          "d":{ type:"re-export", name:"b", from:"/foo/b.js"}
        },
        all: [],
      }
    },
  }

  await expect(() =>  resolveCrossFileConstant({
    parse(modulePath) {
      return parsed[modulePath]
    },
    resolve(specifier, importer) {
      return path.resolve(path.dirname(importer), specifier)
    }
  }, "/foo/bar.js", css)).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
  Caused by: Unable to resolve "a" in module "/foo/a.js"
  Caused by: Unable to resolve "b" in module "/foo/b.js"
  Caused by: Unable to resolve "c" in module "/foo/c.js"
  Caused by: Unable to resolve "d" in module "/foo/d.js"
  Caused by: Unable to resolve "b" in module "/foo/b.js"
  Caused by: Circular dependency detected`)
})

test("Error: Resolve with circular dependency with star exports", async () => {
  const css = `--yak-css-import: url("./a.js:a",selector) {}`

  const parsed: Record<string, ParsedModule> = {
    "/foo/a.js": {
      path: "/foo/a.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          "a": { type:"re-export", name:"b", from:"/foo/b.js"},
        },
        all: [],
      }
    },
    "/foo/b.js": {
      path: "/foo/b.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          "b": { type:"re-export", name:"d", from:"/foo/c.js"}
        },
        all: [],
      }
    },
    "/foo/c.js": {
      path: "/foo/c.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {},
        all: ["/foo/d.js"],
      }
    },
    "/foo/d.js": {
      path: "/foo/d.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          "d":{ type:"re-export", name:"b", from:"/foo/b.js"}
        },
        all: [],
      }
    },
  }

  await expect(() =>  resolveCrossFileConstant({
    parse(modulePath) {
      return parsed[modulePath]
    },
    resolve(specifier, importer) {
      return path.resolve(path.dirname(importer), specifier)
    }
  }, "/foo/bar.js", css)).rejects.toThrow(`Error while resolving cross-file selectors in file "/foo/bar.js"
  Caused by: Unable to resolve "a" in module "/foo/a.js"
  Caused by: Unable to resolve "b" in module "/foo/b.js"
  Caused by: Unable to resolve "d" in module "/foo/c.js"
  Caused by: Unable to resolve "d" in module "/foo/d.js"
  Caused by: Unable to resolve "b" in module "/foo/b.js"
  Caused by: Circular dependency detected`)
})

test("Do not mistake loopback with circular dependency", async () => {
  const css = `color: --yak-css-import: url("./a.js:a",mixin);`

  const parsed: Record<string, ParsedModule> = {
    "/foo/a.js": {
      path: "/foo/a.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          "a": { type:"re-export", name:"b", from:"/foo/b.js"},
        },
        all: [],
      }
    },
    "/foo/b.js": {
      path: "/foo/b.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          "b": { type:"re-export", name:"c", from:"/foo/c.js"},
          "foo": { type:"constant", value: "red" }
        },
        all: [],
      }
    },
    "/foo/c.js": {
      path: "/foo/c.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          "c": { type:"re-export", name:"d", from:"/foo/d.js"}
        },
        all: [],
      }
    },
    "/foo/d.js": {
      path: "/foo/d.js",
      type: "regular",
      exports: {
        importYak: false,
        named: {
          "d":{ type:"re-export", name:"foo", from:"/foo/b.js"}
        },
        all: [],
      }
    },
  }

  const {resolved,dependencies}= await resolveCrossFileConstant({
    parse(modulePath) {
      return parsed[modulePath]
    },
    resolve(specifier, importer) {
      return path.resolve(path.dirname(importer), specifier)
    }
  }, "/foo/bar.js", css)

    assert.strictEqual(resolved, "color: red;")
  expect(dependencies).to.have.members(['/foo/a.js', '/foo/b.js', '/foo/c.js', '/foo/d.js'])

})
