import { test, assert, expect, vi } from "vitest"
import { ModuleExports, ParsedModule, parseModule } from "../parseModule.js";
import { Cache } from "../types.js";

test('parse module with no yak import', async () => {
  const path = "/path/to/module.js"
  const moduleExports: ModuleExports = {
    importYak: false,
    named: {
      foo: { type: "constant", value: "foo" }
    },
    all: []
  }

  const parsedModule = await parseModule({
    extractExports(modulePath) {
      assert.strictEqual(path, modulePath)
      return moduleExports
    },
    getTransformed() {
      assert.fail('module with no yak import should not be transformed')
    }
  }, path)

  if (parsedModule.type !== "regular") {
    assert.fail('module should be parsed as regular')
  }
  assert.strictEqual(parsedModule.path, path)
  assert.strictEqual(parsedModule.exports, moduleExports)
  assert.strictEqual(parsedModule.js, undefined)
  assert.strictEqual(parsedModule.mixins, undefined)
  assert.strictEqual(parsedModule.styledComponents, undefined)
})

test('parse regular module with no mixins or styled components ', async () => {
  const path = "/path/to/module.js"

  const moduleExports: ModuleExports = {
    importYak: true,
    named: {
      foo: { type: "constant", value: "foo" }
    },
    all: []
  }

  const transformed = {
    code: "code",
    map: "map"
  }
    
  const parsedModule = await parseModule({
    extractExports(modulePath) {
      assert.strictEqual(path, modulePath)
      return moduleExports
    },
    getTransformed() {
      return transformed
    }
  }, path)

  if (parsedModule.type !== "regular") {
    assert.fail('module should be parsed as regular')
  }
  assert.strictEqual(parsedModule.path, path)
  assert.strictEqual(parsedModule.exports, moduleExports)
  assert.strictEqual(parsedModule.js, transformed)
  assert.deepEqual(parsedModule.mixins, {})
  assert.deepEqual(parsedModule.styledComponents, {})
})

test('parse regular module with mixins ', async () => {
  const path = "/path/to/module.js"

  const moduleExports: ModuleExports = {
    importYak: true,
    named: {
      foo: { type: "constant", value: "foo" }
    },
    all: []
  }

  const transformed = {
    code: `
      export const simple =
        /*YAK EXPORTED MIXIN:simple
color: red;
*/ /*#__PURE__*/ css();
      export const nested = {
        mixin:
          /*YAK EXPORTED MIXIN:nested:mixin
color: blue;
*/ /*#__PURE__*/ css(),
      };    
    `,
    map: "map"
  }
    
  const parsedModule = await parseModule({
    extractExports(modulePath) {
      assert.strictEqual(path, modulePath)
      return moduleExports
    },
    getTransformed() {
      return transformed
    }
  }, path)

  if (parsedModule.type !== "regular") {
    assert.fail('module should be parsed as regular')
  }
  assert.strictEqual(parsedModule.path, path)
  assert.strictEqual(parsedModule.exports, moduleExports)
  assert.strictEqual(parsedModule.js, transformed)
  assert.deepEqual(parsedModule.mixins, {
    "nested:mixin": {
      nameParts: ["nested", "mixin"],
      type:"mixin",
      value: "color: blue;\n"
    },
    simple: {
      nameParts: ["simple"],
      type:"mixin",
      value: "color: red;\n"
    }
  })
  assert.deepEqual(parsedModule.styledComponents, {})
})

test('parse regular module with styled components', async () => {
  const path = "/path/to/module.js"

  const moduleExports: ModuleExports = {
    importYak: true,
    named: {
      foo: { type: "constant", value: "foo" }
    },
    all: []
  }

  const transformed = {
    code: `
      export const simple =
        /*YAK EXPORTED STYLED:simple:other_simple_aPIQqJ*/ /*YAK Extracted CSS:
.other_simple_aPIQqJ {
  color: red;
}
      */ /*#__PURE__*/ __yak.__yak_div("other_simple_aPIQqJ");
      export const nested = {
        styled:
          /*YAK EXPORTED STYLED:nested.styled:other_nested_styled_aPIQqJ*/ /*YAK Extracted CSS:
.other_nested_styled_aPIQqJ {
  color: blue;
}
      */ /*#__PURE__*/ __yak.__yak_div("other_nested_styled_aPIQqJ"),
      };
    `,
    map: "map"
  }
    
  const parsedModule = await parseModule({
    extractExports(modulePath) {
      assert.strictEqual(path, modulePath)
      return moduleExports
    },
    getTransformed() {
      return transformed
    }
  }, path)

  if (parsedModule.type !== "regular") {
    assert.fail('module should be parsed as regular')
  }
  assert.strictEqual(parsedModule.path, path)
  assert.strictEqual(parsedModule.exports, moduleExports)
  assert.strictEqual(parsedModule.js, transformed)
  assert.deepEqual(parsedModule.mixins, {})
  assert.deepEqual(parsedModule.styledComponents, {
    "nested.styled": {
      nameParts: ["nested", "styled"],
      type: "styled-component",
      value: ":global(.other_nested_styled_aPIQqJ)"
    },
    "simple": {
      nameParts: ["simple"],
      type: "styled-component",
      value: ":global(.other_simple_aPIQqJ)"
    }
  })
})

test('parse regular module with styled component in Css transpilation mode', async () => {
  const path = "/path/to/module.js"

  const moduleExports: ModuleExports = {
    importYak: true,
    named: {
      foo: { type: "constant", value: "foo" }
    },
    all: []
  }

  const transformed = {
    code: `
      export const simple =
        /*YAK EXPORTED STYLED:simple:other_simple_aPIQqJ*/ /*YAK Extracted CSS:
.other_simple_aPIQqJ {
  color: red;
}
      */ /*#__PURE__*/ __yak.__yak_div("other_simple_aPIQqJ");
      export const nested = {
        styled:
          /*YAK EXPORTED STYLED:nested.styled:other_nested_styled_aPIQqJ*/ /*YAK Extracted CSS:
.other_nested_styled_aPIQqJ {
  color: blue;
}
      */ /*#__PURE__*/ __yak.__yak_div("other_nested_styled_aPIQqJ"),
      };
    `,
    map: "map"
  }
    
  const parsedModule = await parseModule({
    transpilationMode: 'Css',
    extractExports(modulePath) {
      assert.strictEqual(path, modulePath)
      return moduleExports
    },
    getTransformed() {
      return transformed
    }
  }, path)

  if (parsedModule.type !== "regular") {
    assert.fail('module should be parsed as regular')
  }
  assert.strictEqual(parsedModule.path, path)
  assert.strictEqual(parsedModule.exports, moduleExports)
  assert.strictEqual(parsedModule.js, transformed)
  assert.deepEqual(parsedModule.mixins, {})
  assert.deepEqual(parsedModule.styledComponents, {
    "nested.styled": {
      nameParts: ["nested", "styled"],
      type: "styled-component",
      value: ".other_nested_styled_aPIQqJ"
    },
    "simple": {
      nameParts: ["simple"],
      type: "styled-component",
      value: ".other_simple_aPIQqJ"
    }
  })
})

test('parse regular module with cache multiple times extract/transform once', async () => {
  const path = "/path/to/module.js"

  const moduleExports: ModuleExports = {
    importYak: true,
    named: {
      foo: { type: "constant", value: "foo" }
    },
    all: []
  }

  const transformed = {
    code: `
      export const simpleStyled =
        /*YAK EXPORTED STYLED:simpleStyled:other_simpleStyled_aPIQqJ*/ /*YAK Extracted CSS:
.other_simpleStyled_aPIQqJ {
  color: red;
}
      export const simpleMixin =
        /*YAK EXPORTED MIXIN:simpleMixin
color: red;
*/ /*#__PURE__*/ css();
    `,
    map: "map"
  }

  let internalCache = new Map()
  const cacheSet = vi.fn((key, data) => {
    internalCache.set(key, data)
  })
  const cacheGet = vi.fn((key) => {
    return internalCache.get(key)
  })
  const cache: Cache<ParsedModule> = {
    set: cacheSet,
    get: cacheGet,
  }

  const parseContext = {
    cache: {
      parse: cache
    },
    extractExports: vi.fn((modulePath) => {
      assert.strictEqual(path, modulePath)
      return moduleExports
    }),
    getTransformed: vi.fn(() => {
      return transformed
    })
  }

  // first call, cache miss
  const parsedModulePromise = await parseModule(parseContext, path)
  
  expect(parseContext.extractExports).toHaveBeenCalledTimes(1)
  expect(parseContext.getTransformed).toHaveBeenCalledTimes(1)

  expect(cacheGet).toHaveBeenLastCalledWith(path)
  expect(cacheGet).toHaveLastReturnedWith(undefined)
  expect(cacheSet).toHaveBeenCalledExactlyOnceWith(path, parsedModulePromise)

  // second call, cache hit
  const parsedModulePromise2 = await parseModule(parseContext, path)

  assert.strictEqual(parsedModulePromise, parsedModulePromise2)

  expect(parseContext.extractExports).toHaveBeenCalledTimes(1)
  expect(parseContext.getTransformed).toHaveBeenCalledTimes(1)

  expect(cacheGet).toHaveBeenLastCalledWith(path)
  expect(cacheGet).toHaveLastReturnedWith(parsedModulePromise)
  expect(cacheSet).toHaveBeenCalledTimes(1)

  // third call, cache hit
  const parsedModulePromise3 = await parseModule(parseContext, path)

  assert.strictEqual(parsedModulePromise, parsedModulePromise3)

  expect(parseContext.extractExports).toHaveBeenCalledTimes(1)
  expect(parseContext.getTransformed).toHaveBeenCalledTimes(1)

  expect(cacheGet).toHaveBeenLastCalledWith(path)
  expect(cacheGet).toHaveLastReturnedWith(parsedModulePromise)
  expect(cacheSet).toHaveBeenCalledTimes(1)

})

test('parse .yak module', async () => {
  const path = "/path/to/module.yak.js"

  const parsedModule = await parseModule({
    evaluateYakModule(modulePath) {
      assert.strictEqual(path, modulePath)
      return {
        string: "foo",
        number: 1,
        boolean: true,
        array: [2, "bar", true],
        object: {
          string: "foobar",
          number: 3,
          boolean: false,
          array: [true, 4, "quux"]
        },
        function: () => {}
      }
    },
    extractExports() {
      assert.fail('.yak module should not be extracted')
    },
    getTransformed() {
      assert.fail('.yak module should not be transformed')
    }
  }, path)

  if (parsedModule.type !== "yak") {
    assert.fail('module should be parsed as yak')
  }
  assert.strictEqual(parsedModule.path, path)
  assert.deepEqual(parsedModule.exports, { 
    importYak:false, 
    all:[], 
    named: { 
      string: { type:"constant", value: "foo" },
      number: { type:"constant", value: 1 },
      boolean: { type:"unsupported", hint: "true" },
      array: {
        type: "record",
        value: {
          "0": { type: "constant", value: 2 },
          "1": { type: "constant", value: "bar" },
          "2": { type:"unsupported", hint: "true" },
        }
      }, 
      object: {
        type: "record",
        value: {
          string: { type:"constant", value: "foobar" },
          number: { type:"constant", value: 3 },
          boolean: { type:"unsupported", hint: "false" },
          array: {
            type: "record",
            value: {
              "0": { type: "unsupported", hint: "true" },
              "1": { type: "constant", value: 4 },
              "2": { type:"constant", value: "quux" },
            }
          }, 
        }
      },
      function: { type:"unsupported", hint: "() => {\n        }"}
    }
  })
})

test('parse .yak module extendsions', async () => {
  const parseContext = {
    evaluateYakModule() {
      return {}
    },
    extractExports() {
      return {
        importYak: false,
        named: {},
        all: []
      }
    },
    getTransformed() {
      return {
        code: "code"
      }
    }
  }

  const parsedModule1 = await parseModule(parseContext, "/path/to/module.yak.js")
  const parsedModule2 = await parseModule(parseContext, "/path/to/module.yak.ts")
  const parsedModule3 = await parseModule(parseContext, "/path/to/module.yak.jsx")
  const parsedModule4 = await parseModule(parseContext, "/path/to/module.yak.tsx")
  const parsedModule5 = await parseModule(parseContext, "/path/to/module.yak.foo.tsx")

  assert.strictEqual(parsedModule1.type, "yak")
  assert.strictEqual(parsedModule2.type, "yak")
  assert.strictEqual(parsedModule3.type, "yak")
  assert.strictEqual(parsedModule4.type, "yak")
  assert.strictEqual(parsedModule5.type, "regular")

})

test('parse .yak module with cache multiple times extract/transform/evaluate once', async () => {
  const path = "/path/to/module.yak.js"

  let internalCache = new Map()
  const cacheSet = vi.fn((key, data) => {
    internalCache.set(key, data)
  })
  const cacheGet = vi.fn((key) => {
    return internalCache.get(key)
  })
  const cache: Cache<ParsedModule> = {
    set: cacheSet,
    get: cacheGet,
  }

  const parseContext = {
    cache: {
      parse: cache
    },
    evaluateYakModule: vi.fn(() => {
      return {
        string: "foo",
      }
    }),
    extractExports: () => {
      assert.fail('.yak module should not be extracted')
    },
    getTransformed: () => {
      assert.fail('.yak module should not be transformed')
    }
  }

  // first call, cache miss
  const parsedModulePromise = await parseModule(parseContext, path)
  
  expect(parseContext.evaluateYakModule).toHaveBeenCalledTimes(1)

  expect(cacheGet).toHaveBeenLastCalledWith(path)
  expect(cacheGet).toHaveLastReturnedWith(undefined)
  expect(cacheSet).toHaveBeenCalledExactlyOnceWith(path, parsedModulePromise)

  // second call, cache hit
  const parsedModulePromise2 = await parseModule(parseContext, path)

  assert.strictEqual(parsedModulePromise, parsedModulePromise2)

  expect(parseContext.evaluateYakModule).toHaveBeenCalledTimes(1)

  expect(cacheGet).toHaveBeenLastCalledWith(path)
  expect(cacheGet).toHaveLastReturnedWith(parsedModulePromise)
  expect(cacheSet).toHaveBeenCalledTimes(1)

  // third call, cache hit
  const parsedModulePromise3 = parseModule(parseContext, path)

  assert.strictEqual(parsedModulePromise, await parsedModulePromise3)

  expect(parseContext.evaluateYakModule).toHaveBeenCalledTimes(1)

  expect(cacheGet).toHaveBeenLastCalledWith(path)
  expect(cacheGet).toHaveLastReturnedWith(parsedModulePromise)
  expect(cacheSet).toHaveBeenCalledTimes(1)
})
