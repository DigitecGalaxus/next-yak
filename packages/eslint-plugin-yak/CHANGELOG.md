# eslint-plugin-yak

## 1.2.0

### Minor Changes

- 59daba4: Improve linting messages to show a concrete before/after built from your own code instead of a generic hint

### Patch Changes

- 99973bd: Allow prop-derived function calls as runtime values in the style-conditions rule
- d864d92: Handle CSS escape sequences in the enforce-semicolon rule without crashing.
- 81d7d96: Detect declaration values in the style-conditions rule by parsing the CSS instead of guessing from a trailing colon
- af93a28: Keep css nesting fixes as editor suggestions instead of advertising automatic fixes

## 1.1.3

### Patch Changes

- 419a3fe: Build eslint-plugin-yak before publishing packages so its dist entrypoint is included in the npm artifact.

## 1.1.2

### Patch Changes

- 2d9b301: Updated all dependencies

## 1.1.1

### Patch Changes

- e906d2a: Update docs

## 1.1.0

### Minor Changes

- ddb0e93: Add deprecation warning for `:global()` selectors

## 1.0.1

### Patch Changes

- 0d8099d: add typings for recommended eslint configs

## 1.0.0

### Major Changes

- 31ed5a2: Add eslint plugins to help with the migration from styled-components to next-yak
