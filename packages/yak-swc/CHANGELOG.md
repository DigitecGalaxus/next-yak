# yak-swc

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
