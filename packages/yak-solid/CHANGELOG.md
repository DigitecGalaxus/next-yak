# @yak/solid

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
