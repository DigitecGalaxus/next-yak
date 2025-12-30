# next-yak Cross File Tests

This package contains Webpack integration tests for next-yak, to ensure that our custom TypeScript and CSS loaders work correctly together.

## Purpose

The main goals of these Webpack tests are to:

1. Verify the correct extraction of CSS from TypeScript files
2. Ensure proper compilation of TypeScript with our custom loaders
3. Validate the integration of next-yak's compilation process with Webpack
4. Catch potential regressions or incompatibilities introduced by changes in next-yak or Webpack

## Implementation

The test suite uses a custom Webpack configuration and compilation process that mimics the Next.js build environment. It includes:

- A memory-based file system for handling virtual files during testing
- Custom Webpack configuration tailored for next-yak's needs
- Integration with Yak for CSS-in-JS processing
- A compilation function that orchestrates the entire process and captures results