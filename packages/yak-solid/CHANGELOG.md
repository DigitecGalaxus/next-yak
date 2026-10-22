# @yak/solid

## 0.4.0

### Minor Changes

- c04e52c: Move the option `experiments.debug` of the Vite plugin to `debug`.
- 3724852: `@yak/solid` needs Node.js 22.18 or later. CommonJS code can now load it with `require()`.

### Patch Changes

- 681904e: Relative `url()` paths in yak styles load their files, also when a mixin from another directory uses them.
- 243320b: Remove the two "Module not found" warnings that Turbopack showed for the `.yak` file evaluator
- Updated dependencies [5d9ada3]
- Updated dependencies [76b9ac8]
- Updated dependencies [50ef4de]
- Updated dependencies [e030a2d]
- Updated dependencies [50ef4de]
- Updated dependencies [50ef4de]
- Updated dependencies [e030a2d]
  - @yak/swc@10.0.0

## 0.4.0-rc.2

### Patch Changes

- 681904e: Relative `url()` paths in yak styles load their files, also when a mixin from another directory uses them.
- 243320b: Remove the two "Module not found" warnings that Turbopack showed for the `.yak` file evaluator
- Updated dependencies [76b9ac8]
  - @yak/swc@10.0.0-rc.2

## 0.4.0-rc.1

### Minor Changes

- c04e52c: Move the option `experiments.debug` of the Vite plugin to `debug`.
- 3724852: `@yak/solid` needs Node.js 22.18 or later. CommonJS code can now load it with `require()`.

### Patch Changes

- Updated dependencies [5d9ada3]
- Updated dependencies [e030a2d]
- Updated dependencies [e030a2d]
  - @yak/swc@10.0.0-rc.1

## 0.3.1-rc.0

### Patch Changes

- Updated dependencies [50ef4de]
- Updated dependencies [50ef4de]
- Updated dependencies [50ef4de]
  - @yak/swc@10.0.0-rc.0

## 0.3.0

### Minor Changes

- a718ac7: Improve server rendering performance for `styled(Component)` and fix crashes when forwarding reactive props.

  Requires `solid-js` and `@solidjs/web` 2.0.0-rc.10 or later.

### Patch Changes

- yak-swc@9.10.2

## 0.2.1

### Patch Changes

- ee11260: Respect Vite's file access restrictions when loading virtual CSS modules in the dev server.
- yak-swc@9.10.1

## 0.2.0

### Minor Changes

- 71b8d7b: Update dependencies and publish the direct dependencies with semver ranges instead of exact pins
- eadda37: Faster styled components, especially on the server. Requires Solid 2.0.0-rc.8; an app that bundles `@yak/solid` for SSR (`ssr.noExternal`) must bundle Solid too.

  - Object-form `.attrs()` with plain values is baked into the tag at definition, so such components render on the static path
  - `a`, `script`, `style` and `title` render like every other tag; hydration keys change, so server and client need the same `@yak/solid` version
  - Fixes: `merge()` on a component target keeps the generated class and sees no `$` props; chained `.attrs()` render a child once; a `textarea` renders its `value` as content; `script` and `style` content stays raw; a `component` prop reaches styled tags; the untransformed `styled` export no longer breaks `await`

### Patch Changes

- 5c80c54: Fix an issue where a css prop combined with a spread didn't hydrate on SolidJS.
- Updated dependencies [5c80c54]
- Updated dependencies [71b8d7b]
  - yak-swc@9.10.0

## 0.1.0

### Minor Changes

- d7be766: Initial release of `@yak/solid` the SolidJS runtime for yak targeting Solid 2 with full build time css extraction

### Patch Changes

- Updated dependencies [63847f8]
- Updated dependencies [1a5a828]
- Updated dependencies [d7be766]
  - yak-swc@9.9.0
