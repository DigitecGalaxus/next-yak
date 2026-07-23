# yak-swc

## 9.7.0

### Minor Changes

- eebca6f: Fold statically known css props into a plain `className` at build time instead of emitting a per-render `__yak_mergeCssProp` call, e.g. `<div css={css`color: red`} />` becomes `<div className="yX" />` and conditional styles become `className={"yX" + (on ? " yX1" : "")}`. Elements with an existing `className`, spread props or dynamic values keep the runtime merge path unchanged, as does every css prop when `foldStatic: false`; a css prop that references a mixin is a compile error.
- eebca6f: The css prop now rejects a reference to styles declared elsewhere (`css={mixin}`) with a compile error. Wrap the reference in a css template instead: `css={css`${mixin}`}`. Such a reference compiles to nothing at the usage, so it silently rendered unstyled.
- 67b8875: Add JSX folding: a usage of a styled component declared in the same file compiles to a plain element, skipping the runtime wrapper. Rendering gets considerably faster, and nothing needs configuring.

  ```tsx
  const Icon = styled.span<{ $active?: boolean }>`
    min-height: 24px;
    ${({ $active }) =>
      $active &&
      css`
        color: red;
      `}
  `;
  const App = () => <Icon $active={on} />;

  // compiles to
  const App = () => (
    <span className={"yak-icon" + (on ? " yak-icon--active" : "")} />
  );
  ```

  What folds:

  - A fully static component folds to its plain element.
  - `styled(Component)` folds to the wrapped component, which may be imported.
  - A fully static `styled(Parent)` chain collapses to the base element, at any depth, with the class names merged parent-first. The declaration flattens too, so an exported chain ships one wrapper and its unused base components drop out.

  What keeps the runtime path: spread props, a `theme` prop, dynamic css values, `.attrs()`, and components not declared as a top-level `const`. A chain also stays a chain when its parent is dynamic, imported, or bound with `let`.

  Set `foldStatic: false` to turn folding off; it also gates the css prop fold.

  Caveats: a folded usage is no longer a component, so it does not appear in React DevTools or component stacks, and `child.type === Icon` no longer matches it. Foreign `$props` on a folded usage are forwarded to the element, not stripped. Prop expressions still run the same number of times, in the same order, as the original JSX — except in code React's purity rule already forbids: an unread `$prop` is dropped without running, and a getter behind a member read (`$a={obj.x}`) can fire once per condition. The FAQ has the full rules.

### Patch Changes

- 011ace5: A `className` string next to a `css` prop kept its JSX encoding: `className="Food &amp; Drink"` rendered the entity into the DOM class, and a backslash class like `before:content-['\2713']` broke the build with a SyntaxError. The value now reaches the DOM exactly as written.
- eebca6f: Drop empty css props at build time instead of emitting a dead class name, e.g. ` <div css={css``} /> ` becomes `<div />` and an empty ternary arm folds to `""`. A nested empty ` css` `` also folds to an empty class name instead of keeping the whole css prop on the runtime merge path.
- 06a6c95: A folded `className` merge keeps the user's class name exactly as written: backslashes, HTML entities and emoji reach the DOM byte for byte.

## 9.6.0

### Minor Changes

- 00e5021: Add `globalStyle` to write global styles that are extracted at build time and apply once the file is imported

## 9.5.1

### Patch Changes

- 056b4d9: Fix a stray `/*#__PURE__*/` on inlined `css` mixins that could make a bundler tree-shake away an entire export under the wasm plugin
- 056b4d9: Emit the default-export marker for styled components exported through a TS cast (e.g. `export default Page as typeof Page`) so cross-file default imports resolve correctly
- 280f4c9: Add a `strictCssProp` option (default `true`) that fails the build on a `css` prop next-yak can't handle. Turn it off to leave unrecognized `css` props untouched, e.g. when another library on the same element uses its own `css` prop. Invalid `css` props are now left in place rather than silently stripped.

## 9.5.0

### Minor Changes

- c9bd2de: Update dependencies

### Patch Changes

- 5d40a77: Fix building the SWC plugin on Rust 1.96+ and upgrade swc_core from 56.0.0 to 68.0.6.

  Rust 1.96 removed the implicit `--allow-undefined` for wasm targets, which broke linking the plugin (`undefined symbol: __set_transform_result`). The wasm build now passes the link-arg explicitly, the Rust toolchain is pinned via `rust-toolchain.toml`, and swc_core (plus the separately pinned swc crates) moved to the current major. No behavior changes — all transform snapshots are unchanged.

## 9.4.2

### Patch Changes

- df860c9: Fix dynamic interpolations wrapped in CSS string quotes (e.g. `content: "${(p) => p.$x}"`)
- 07d80d0: Fix typecasts (`as unknown as ...`) breaking cross-file selectors, mixin inlining and keyframes references.
- f18484e: TypeScript casts (`as`, `as const`, `!`, `satisfies`, parens) inside CSS interpolations no longer prevent values from being statically inlined.
- 75beb6b: Emit an error when a dynamic interpolation is used inside an at-rule query.
- 842c24c: Fix HMR full page reloads for styled-only files by injecting `$RefreshReg$` for exported styled components

## 9.4.1

## 9.4.0

### Patch Changes

- caac236: Fix false "Could not parse member expression" error for dynamic computed member access in runtime expressions (e.g. `SIZES[size].width`)
- f7198df: Skip empty CSS imports
- e77edd3: Fix referencing components without any styles

## 9.3.0

## 9.2.0

### Patch Changes

- bc1f82e: Updated dependencies

## 9.1.0

### Minor Changes

- ddb0e93: Add deprecation warning for `:global()` selectors

### Patch Changes

- 3e4fc3b: Add experimental vite support
- 846cc4c: Unified CSS import configuration with placeholder support

## 9.0.0

### Major Changes

- a85dcba: Add support for next.js 16.1.0

## 8.0.2

## 8.0.1

## 8.0.0

### Major Changes

- 24caa1f: Add limited Turbopack support (Limitation: .yak files can't use `import` statements)
- 6f84e74: Update to Next.js 16

### Minor Changes

- 2e43185: Add support for async RSC Yak Theme Contexts (yak.context.ts)

### Patch Changes

- cea6d53: Allow exporting Yak components as default expressions

## 7.0.0

### Major Changes

- e4d230c: Add support for next.js >= 15.4.4

## 6.0.0

### Major Changes

- 9835170: Update swc_core to be compatible with Next.js 15.4

## 5.7.2

### Patch Changes

- 460a5da: Fixed an issue when only `atoms` are used

## 5.7.1

## 5.7.0

### Minor Changes

- eeaae8f: Added support for atoms in CSS prop & enhanced atoms function to manipulate class names and styles in a callback

### Patch Changes

- 938bca4: Improve typings
- ab58a54: Added support for constant string and number keys of object in the same file

## 5.6.1

### Patch Changes

- cb02484: Add cross file constant supports also for default or namespace imports

## 5.6.0

### Minor Changes

- 6c859e5: Add new "experiments.transpilationMode" option to transpile to CSS instead of CSS Modules
- a8fce5a: Make swc plugin integration an enabled-by-default cargo feature (not used in playground)

## 5.5.0

### Minor Changes

- 6ed6e55: Updated all dependencies

### Patch Changes

- 720e426: Add support for turbopacks relative filepaths

## 5.4.0

### Minor Changes

- 2ba5777: Add support for `@property` inside `styled` and `css` tags

## 5.3.1

### Patch Changes

- 4c9d3c3: Fix animation references by using "global()" instead of ":global()"

## 5.3.0

### Minor Changes

- 3fde4f1: use a turbopack compatible swc plugin path

### Patch Changes

- 14f2db8: Fix keyframe animation references when used before declaration

## 5.2.2

### Patch Changes

- cd964ac: fix cross file selectors
- 364f415: fix recursive class name replacement inside mixins

## 5.2.1

### Patch Changes

- 4f69bd9: fix class name escaping in dev mode

## 5.2.0

### Minor Changes

- d018370: minify class names for production builds

## 5.1.0

### Minor Changes

- e2afeb9: Improved React DevTools support - Styled components created with next-yak now show up with their actual variable names in React DevTools instead of a generic yak label

### Patch Changes

- d461cf5: Mark `__yak_unitPostFix` as pure (generated code)
- b3e4fec: Minor refactoring of visitors

## 5.0.0

### Major Changes

- 6fd9b9a: **swc:** Update to swc_core 16.0.0 (compatible with @swc/core@1.11.1)

## 4.1.0

### Minor Changes

- 0eac2b4: improve bundle size by compiling styled.TAG_NAME

### Patch Changes

- ea744ac: Update wasm target to wasm-wasip1

## 4.0.4

### Patch Changes

- 171898f: Fix issue with the css prop where it wouldn't be generated when used inside an exported component
- d4379a2: Updated all dependencies

## 4.0.3

### Patch Changes

- 154da2f: fix css prop class name access in nested jsx

## 4.0.2

### Patch Changes

- 5ce7f16: Enable css prop support for styled components, not just native HTML elements by fixing a bug in the types
- 2f0ba89: Enable conditional styling for the css prop

## 4.0.1

### Patch Changes

- 859db1c: Improve cross-os hashes to be more consistent.

## 4.0.0

### Major Changes

- f204637: Add support for Next.js 15.0.4 (SWC 5.x)

## 3.1.0

### Minor Changes

- fcba925: allow to define a prefix for generated css names like variables

### Patch Changes

- 3d6e505: fix a parsing bug for unquoted urls inside url()

## 3.0.1

### Patch Changes

- 411ad36: Better error message for wrong usage of dynamic properties in nested template

## 3.0.0

### Major Changes

- 94f083f: Upgrade SWC to 3.x to add support for Next.js 15.0.0

## 0.8.0

### Minor Changes

- 7a080ab: Improved CSS class name generation using FNV-1a hashing for better cross-platform consistency and shorter identifiers
