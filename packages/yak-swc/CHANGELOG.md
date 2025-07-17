# yak-swc

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
