# cross-file-yak

Cross-file utility for next-yak that enables resolution of constants, mixins, and styled components across module boundaries.

## Overview

This package provides utilities to parse and resolve cross-file references in CSS-in-JS code, particularly for the next-yak ecosystem. It enables importing and using constants, mixins, and styled components from other modules within your CSS template literals.

## Features

- **Cross-file constant resolution**: Import and use constants from other modules in your CSS
- **Mixin support**: Share CSS mixins across files
- **Styled component selectors**: Reference styled components as selectors
- **Caching**: Built-in caching for improved performance
- **Circular dependency detection**: Prevents infinite resolution loops

## API

### `resolveCrossFileConstant(context, filePath, css)`

Resolves cross-file selectors in CSS strings.

- `context`: ResolveContext containing parse and resolve functions
- `filePath`: Path to the current file being processed
- `css`: CSS string containing cross-file imports

Returns a promise with:

- `resolved`: CSS string with resolved imports
- `dependencies`: Array of file paths that were imported

### `parseModule(filePath, source)`

Parses a module and extracts exports, styled components, and mixins.

## Installation

```bash
npm install cross-file-yak
```

## Development

```bash
# Build the package
pnpm run build

# Run tests
pnpm test
```

## License

MIT
