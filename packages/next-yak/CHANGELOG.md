# next-yak

## 5.0.0

### Major Changes

- 6fd9b9a: Add compatibility with Next.js 15.2.1

### Patch Changes

- Updated dependencies [6fd9b9a]
  - yak-swc@5.0.0

## 4.1.1

### Patch Changes

- 79bb695: Fix dead-lock inside webpack caused by css-loader cache

## 4.1.0

### Minor Changes

- 0eac2b4: improve bundle size by compiling styled.TAG_NAME

### Patch Changes

- Updated dependencies [ea744ac]
- Updated dependencies [0eac2b4]
  - yak-swc@4.1.0

## 4.0.4

### Patch Changes

- 171898f: Fix issue with the css prop where it wouldn't be generated when used inside an exported component
- d4379a2: Updated all dependencies
- 7f90169: Updated @types/react to 19.0.2
- 145c621: Refactor CSS prop types to improve type inference and consistency
  - Added new type `CSSProp` to be used by custom components to receive the `css` prop in a somewhat typesafe way
  - Updated `css` function to return `ComponentStyle` only

## 4.0.3

### Patch Changes

- 154da2f: fix css prop class name access in nested jsx
- Updated dependencies [154da2f]
  - yak-swc@4.0.3

## 4.0.2

### Patch Changes

- 5ce7f16: Enable css prop support for styled components, not just native HTML elements by fixing a bug in the types
- 2f0ba89: Enable conditional styling for the css prop
- Updated dependencies [2f0ba89][5ce7f16]
  - yak-swc@4.0.2

## 4.0.1

### Patch Changes

- Updated dependencies [859db1c]
  - yak-swc@4.0.1

## 4.0.0

### Major Changes

- d77a860: Upgrade to React 19
- f204637: Add support for Next.js 15.0.4 (SWC 5.x)

## 3.1.0

### Minor Changes

- efa3009: allow to define a prefix for generated css names like variables

### Patch Changes

- 0b95fc1: Improve the error message for dynamic css functions when returning invalid values
- Updated dependencies [3d6e505]
- Updated dependencies [fcba925]
  - yak-swc@3.1.0

## 3.0.1

### Patch Changes

- fb2b2ca: Fix types to allow using constants in keyframes
- 70a94a9: Updated React TypeScript definitions:
  - @types/react from 18.2.28 to 18.3.12
  - @types/react-dom from 18.2.13 to 18.3.1
- 365af90: Fix type inference bug for selectors inside mixins
- Updated dependencies [411ad36]
  - yak-swc@3.0.1

## 3.0.0

### Major Changes

- 94f083f: Upgrade SWC to 3.x to add support for Next.js 15.0.0

### Patch Changes

- Updated dependencies [94f083f]
  - yak-swc@3.0.0

## 2.4.0

### Patch Changes

- Improve hashing of css variables (yak-swc@0.8.0)

## 2.3.0

### Added

- Allow using css prop in jsx components #169

## 2.2.0

### Fixed

- Fixed CSS ordering issues with styled component inheritance by ensuring CSS module imports appear after component dependencies #202

## 2.1.0

### Added

- Added support for generic components with improved type handling
- Enhanced TypeScript type definitions for generic components

### Changed

- Refined type definitions for function components to better work with next-yak
- Improved type inference for generic component props

## 2.0.0

### Added

- Added validation for dynamic property value expressions
- Added explicit error messages for non-arrow function expressions in CSS properties

### Breaking Changes

- Dynamic values in CSS properties must now be wrapped in arrow functions
- Removed dependency on Babel comparison tests
- Unified build and test infrastructure around SWC

### Changed

- Improved handling of unit postfixing and value calculations
- Enhanced error reporting for invalid CSS property expressions

### Fixed

- Fixed handling of negative number literals in CSS values
- Improved handling of mathematical expressions in CSS values

### Migration Guide

- Update all dynamic CSS property values to use arrow functions
- Example: Change `margin: value` to `margin: () => value`
- If using Babel-specific features, refer to the SWC migration guide in the documentation

## 1.2.2

### Added

- Support for negative constants in cross-file imports
- Improved error messages for unsupported export types

### Changed

- Enhanced cross-file constant resolution
- Improved handling of object property paths in imports

### Fixed

- Fixed unary expression handling for negative numbers
- Improved error messages for module resolution failures

## 1.2.1

### Fixed

- Fixed type definitions for styled components using selector interpolation
- Improved type inference for components with nested selectors
- Fixed prop requirements for styled components using selector interpolation

## 1.2.0

### Added

- Support for nested object paths in exported mixins
- Enhanced support for special characters in keyframe names

### Changed

- Improved naming convention for exported mixins with nested paths
- Enhanced cross-file mixin resolution with better path handling

### Fixed

- Fixed handling of special characters in export names
- Improved resolution of nested object exports

## 1.1.4

### Added

- Added contributing guide with comprehensive development setup instructions
- Added detailed debugging instructions and common issues documentation

### Changed

- Updated documentation with clearer contribution guidelines
- Improved project structure documentation

## 1.1.3

### Added

- Support for percentage values in CSS units
- Enhanced math evaluation capabilities

### Changed

- Improved handling of CSS units and calculations
- Better support for dynamic margin and positioning values

### Fixed

- Fixed CSS unit detection for percentage values
- Improved handling of mathematical expressions in CSS values

## 1.1.2

### Fixed

- Fixed member expression chain resolution
- Improved handling of nested property access in imports
- Enhanced cross-file constant resolution

## 1.1.1

### Added

- Support for TypeScript 'as' expressions in styled components
- Improved type casting support

### Fixed

- Fixed handling of type assertions in styled component definitions

## 1.1.0

### Added

- Support for cross-file selectors with type safety
- Enhanced TypeScript type definitions for selectors

### Changed

- Improved handling of cross-file component references
- Enhanced type inference for styled components

## 1.0.4

### Fixed

- Fixed theme prop forwarding in styled components
- Improved prop handling in component composition

## 1.0.3

### Changed

- Updated yak-swc dependency to version 0.4.0
- Improved handling of keyframe animations

### Added

- Support for keyframes in object properties
- Enhanced animation name generation

## 1.0.2

### Changed

- Updated internal property filtering to remove undefined props
- Improved runtime component property handling

### Fixed

- Fixed handling of undefined properties in styled components
- Improved property filtering for DOM elements

## 1.0.1

### Changed

- Improved attribute handling in styled components for better compatibility with styled-components
- Enhanced performance by skipping theme context access when not needed
- Optimized class name and style merging with smarter prop combining
- Refined handling of attrs inheritance in component composition

### Fixed

- Fixed sequence of attrs function execution in component inheritance
- Fixed props deletion and renaming in attrs functions
- Improved class name merging order for better predictability
- Enhanced attribute processing to maintain correct execution order in nested components

### Internal

- Replaced internal `__yak` component marker with Symbol-based identification
- Improved type definitions for better TypeScript support
- Added comprehensive test coverage for attribute handling edge cases
- Restructured internal attribute processing pipeline for better maintainability

## 1.0.0

### Added

- SWC Rust Plugin is now the default compilation method
- Published as version 1.0.0 indicating API stability
- Added cross-file selectors as standard feature (no longer experimental)
- Added streamlined documentation site built with Fumadocs
- Added live playground for testing and experimenting

### Changed

- **BREAKING**: Removed Babel plugin in favor of SWC for better performance
- **BREAKING**: Changed `withYak` default behavior to use SWC plugin
- **BREAKING**: Removed the experimental `crossFileSelectors` flag as this is now standard
- **BREAKING**: Removed experimental feature flags from YakConfigOptions
- **BREAKING**: Updated minimum Node.js version requirement to >=20
- **BREAKING**: Consolidated `withYak` and `withYakSwc` into a single `withYak` export
- Improved package exports configuration for better module compatibility
- Updated documentation with comprehensive guides and examples
- Reduced bundle size by removing Babel dependencies
- Streamlined build process using SWC for all transformations

### Removed

- **BREAKING**: Removed Babel plugin and related configuration options
- **BREAKING**: Removed withYakSwc export (use withYak instead)
- **BREAKING**: Removed support for non-SWC compilation
- Removed experimental feature flags
- Removed playground package in favor of integrated documentation site playground

### Fixed

- Enhanced cross-file CSS resolution with improved module handling
- Improved CSS module resolution and import handling
- Fixed resolution of namespace exports in cross-file constants

### Security

- Dependencies updated to latest stable versions

### Documentation

- Added migration guide from older versions
- Updated documentation with SWC-specific information
- Added examples for all supported features
- Enhanced TypeScript documentation and type definitions

## 0.3.1

### Added

- Enhanced support for namespace exports in cross-file constants
- Added support for object property paths in CSS imports
- Added improved handling of CSS semicolons in imports

### Fixed

- Fixed handling of CSS variables and constants in cross-file imports
- Improved handling of semicolons in constant value imports
- Fixed resolution of namespace exports (e.g. `export * as colors from './constants'`)
- Enhanced support for nested object constant values

### Changed

- Improved constant resolution for object properties in CSS imports
- Better handling of CSS variable imports from constant files

## 0.3.0

### Added

- Added SWC Rust Plugin on npm as `yak-swc` package
- Added comprehensive cross-file testing suite for webpack integration
- Added support for more sophisticated CSS-in-JS patterns across files
- Added improved mixin and selector handling in CSS transforms

### Changed

- Made cross-file selectors a fully supported feature (no longer experimental)
- Enhanced CSS parsing with dedicated parser module written in Rust
- Improved handling of CSS imports and selectors across files
- Updated documentation with SWC plugin information and usage
- Modified constant handling for better cross-file support

### Fixed

- Fixed handling of cross-file mixins and selectors
- Improved CSS module resolution across files
- Fixed issues with nested mixins and selectors
- Enhanced error reporting for invalid CSS patterns

## 0.2.7

### Added

- Added SWC plugin support as an alternative to Babel for significantly faster compilation
- Added Rust-based CSS parser and transformation pipeline
- Added comprehensive test suite for SWC plugin including snapshot tests
- Added benchmarks for extension detection and other optimizations
- Added support for Rust workspace with CSS parser, relative path handling, and SWC plugin crates

### Changed

- Updated dependencies including React to 18.3.1 and Vitest to 2.0.4
- Improved string escaping in CSS output for better standards compliance
- Enhanced CSS module import handling for better cross-file support
- Updated webpack configuration to support SWC plugin integration
- Added build:swc command for Rust-based compilation

### Fixed

- Fixed string escaping in CSS content properties to avoid double escaping
- Fixed handling of escaped characters in CSS values
- Improved CSS parsing reliability with proper string and comment handling
- Fixed CSS output formatting for special characters and units

## 0.2.6

### Added

- Added Vercel deployment workflow for example package
- Added improved debugging capabilities with new experiments.debug option in YakConfigOptions
- Added support for record-type constant imports in CSS (e.g., importing nested objects)

### Changed

- Updated CodSpeed action from v1 to v2
- Updated @codspeed/benchmark.js-plugin to version 3.1.0
- Enhanced CSS parser handling of comments with more robust state tracking
- Improved CSS import encoding for better cross-file selector support
- Updated inline documentation and error messages

### Fixed

- Fixed handling of CSS comments in template literals and selectors
- Improved state tracking for inline and block comments in CSS parsing
- Fixed module import handling in cross-file selectors

## 0.2.5

### Added

- Added MIT license file
- Added package metadata including description, homepage, repository, and keywords
- Added maintainer information
- Added comprehensive documentation for internal modules

### Changed

- Reorganized runtime internals into a single "/internal" export
- Improved CSS variable naming convention to use double underscores
- Enhanced unit postfix handling for better type safety
- Updated imports to use "next-yak/internal" instead of separate runtime internals
- Improved handling of CSS class names for props with $ prefix

### Fixed

- Fixed CSS unit handling with primitive values
- Enhanced type safety in unit postfix helper
- Improved class name generation for components with $ prefixed props

## 0.2.4

### Changed

- Updated pnpm/action-setup from v2 to v4 in GitHub workflows
- Updated pnpm version to 8.6.1 in workflows
- Simplified package.json engine requirements
- Improved CSS box-sizing inheritance in benchmark layouts
- Enhanced error handling in benchmark tests
- Added experiments section to documentation
- Added live playground link to documentation

### Added

- New stackblitz starter kit for easier project initialization
- Added error handling for component rendering in benchmarks
- Added support for CSS module cross-file dependencies

### Fixed

- Fixed loader resolution issues
- Improved CSS module handling in the build process
- Enhanced error handling in the build pipeline
- Fixed box-sizing inheritance in styled layouts

## 0.2.3

### Added

- Support for cross-file selectors through new `experiments.crossFileSelectors` option
- Webpack integration tests for better end-to-end testing coverage
- Improved import resolution for cross-file component references

### Changed

- Updated Babel plugin to support cross-file component targeting
- Enhanced CSS loader to handle module-based selector imports
- Improved error messages for cross-file selector usage

### Fixed

- Fixed CSS module resolution for external component references
- Improved handling of import paths in CSS selectors

## 0.2.2

### Added

- Enhanced type checking for component composition
- New test cases for styled component overriding and merging
- Improved TypeScript type inference for styled components

### Changed

- Updated to TypeScript 5.5.2
- Refined type definitions for CSS interpolation
- Better handling of component props inheritance
- Improved type inference for styled component props

### Fixed

- Type checking issues with component composition
- Props inheritance in nested styled components

## 0.2.1

### Changed

- Added playground link to documentation navigation
- Updated build configuration for better module compatibility
- Removed postcss-nested dependency
- Improved loader resolution for better compatibility

### Fixed

- Module resolution issues in webpack configuration
- CSS loader compatibility with Next.js
- External module dependency handling in tsup configuration

## 0.2.0

### Added

- CSS prop support for more flexible inline styling
- JSX runtime support for better TypeScript integration with CSS prop
- Support for JSX import source in tsconfig.json
- New playground component with live editing capabilities
- Monaco editor integration in the playground

### Changed

- Updated babel plugin to handle CSS prop transformation
- Improved TypeScript definitions for CSS prop support
- Enhanced documentation with CSS prop examples and migration guide
- Restructured internal modules for better code organization
- Added support for merging CSS props with existing className and style props

## 0.1.2

### Fixed

- Scope handling in CSS parser for proper CSS nesting
- Declaration closure boundaries in CSS parsing
- Missing semicolon handling in CSS parser
- Double quote string handling in CSS output

### Changed

- Added PURE annotation comments for better tree-shaking in production builds
- Improved TypeScript types and imports for babel plugin
- Updated README with latest PR references

## 0.1.1

### Added

- Added pure annotation (`/*#__PURE__*/`) to yak components for better tree-shaking
- Added prettier formatting configuration and scripts

### Changed

- Improved code formatting consistency across the codebase
- Enhanced build workflow to ensure proper build order before tests

## 0.1.0

### Added

- New CSS parser for better handling of incomplete CSS and nested selectors
- CSS-to-string converter for more consistent CSS output
- Development mode support for more readable class names

### Changed

- Completely refactored the CSS processing pipeline
- Improved CSS class name generation for better clarity and debugging
- Enhanced handling of nested selectors and at-rules
- Better support for CSS comments and string literals
- More reliable handling of escaped characters in CSS
- Restructured internal API for better maintainability
- Improved test coverage with more comprehensive test cases

### Fixed

- Fixed issues with CSS nesting and scope handling
- Fixed handling of empty declarations in CSS
- Fixed multiline string and comment parsing in CSS

## 0.0.3

### Changed

- Modernized build system and file structure
- Migrated loaders to TypeScript
- Improved code organization with better file separation
- Enhanced build configuration using tsup

## 0.0.3

### Changed

- Simplified build system by consolidating all build tasks into tsup config
- Improved package file organization and structure

## 0.0.3

### Added

- Support for ESM imports in Next.js configuration
- Added proper import/require support for withYak

### Changed

- Updated documentation with ESM configuration examples
- Improved Next.js plugin compatibility

## 0.0.3

### Changed

- Improved theme handling in styled components
- Better handling of theme props in component inheritance
- Enhanced prop filtering for styled components

### Fixed

- Fixed theme inheritance in nested styled components
- Resolved issues with prop forwarding in styled components

## 0.0.3

### Changed

- Enhanced theme handling in styled components and attrs
- Improved prop filtering and forwarding behavior
- Better handling of theme context in component hierarchy

### Fixed

- Fixed theme access in attrs components
- Resolved prop forwarding issues with $-prefixed props

## 0.0.3

### Added

- Support for automatic CSS unit detection in expressions
- Added runtime helpers for unit postfixing
- Enhanced CSS unit handling in arrow functions

### Changed

- Improved handling of CSS units in dynamic values
- Better support for complex expressions with units

## 0.0.3

### Fixed

- Fixed module resolution issue in tsloader
- Improved loader compatibility

## 0.0.3

### Added

- Support for array-like constant access
- Enhanced support for complex property paths in constants

### Changed

- Improved constant resolution for nested properties
- Better handling of CSS variable generation
- Updated documentation with better examples

### Fixed

- Fixed class name generation for components
- Improved handling of themed components

## 0.0.2

### Added

- Documentation site using Vocs
- Support for bracket notation in const imports (e.g., queries["sm"])

### Changed

- Enhanced CSS constant handling with bracket notation support
- Improved documentation with new comprehensive guides and examples

### Fixed

- Issues with constant property access in CSS-in-JS expressions

## 0.0.2

### Added

- Support for detecting and inlining constant values in CSS
- Better handling of static string and number literals

### Changed

- Improved validation of runtime values in CSS
- Better error messages for constant usage

## 0.0.2

### Added

- New validation system for runtime values in CSS expressions
- More detailed error messages for potential runtime constant misuse

### Fixed

- Issues with using top-level constants as dynamic values

## 0.0.2

### Added

- Support for static CSS literals in .yak files via next-yak/static
- New mixin system for build-time constants

### Changed

- Updated documentation with new examples and videos
- Improved build and test scripts

## 0.0.2

### Added

- Better CSS name generation for conditional styles
- Support for deriving CSS class names from expressions

### Changed

- Improved handling of nested CSS expressions
- Enhanced condition parsing for CSS literals

## 0.0.2

### Changed

- Improved CSS class naming for dynamic styles
- Enhanced handling of nested CSS literals

### Fixed

- Issues with class name generation for conditional styles
- Problems with nested CSS expressions

## 0.0.2

### Added

- New error messages for mixin usage in nested selectors
- Better validation of dynamic selectors

### Changed

- Updated documentation with new examples
- Improved error handling for nested CSS

## 0.0.2

### Added

- Support for nesting CSS literals
- Improved handling of complex CSS expressions

### Changed

- Enhanced CSS class name generation
- Better handling of nested styles and selectors

## 0.0.2

### Added

- Validation for dynamic selectors
- Better error messages for invalid CSS usage

### Fixed

- Issues with dynamic selector handling
- Problems with nested CSS selectors

## 0.0.1

### Added

- Support for nested CSS selectors
- New classifier for CSS expressions

### Changed

- Improved handling of CSS variables
- Better parsing of CSS expressions

## 0.0.1

### Added

- Improved class name generation to be more descriptive and predictable based on component names

### Changed

- Modified class name format to use component names as prefixes (e.g., `Button_0` instead of `yak_0`)
- Generic type improvements for TypeScript types

### Fixed

- Component targeting issues for styled components without styles

## 0.0.1

### Added

- Support for targeting components directly in CSS using template literals
- Support for CodSpeed benchmarks

### Fixed

- Improved support for CSS nesting

## 0.0.1

### Added

- Typescript improvements for better type inference
- GitHub Actions workflow for automated testing

### Changed

- Updated Node.js requirement to >= 20

## 0.0.1

### Added

- Support for forwardRef in styled components
- Support for attrs API similar to styled-components
- Component references in CSS selectors

## 0.0.1

### Added

- Theme context provider with server component support
- Improved TypeScript type definitions

### Changed

- Restructured exports for better module compatibility

## 0.0.1

### Added

- Theme context support
- Better package exports configuration

### Changed

- Modified build system to support CJS and ESM

## 0.0.9

### Added

- Support for ESM and CommonJS module formats
- Improved build system using tsup

## 0.0.8

### Added

- Support for keyframes animations
- Improved class name handling
- Support for conditional styles with atoms API

### Fixed

- Class name merging issues
- Ref forwarding bugs

## 0.0.6

### Added

- Support for atomic CSS (Tailwind-like utility classes)
- Example stackblitz project
- Support for styled components inheritance

### Changed

- Better documentation with examples
- Improved styled API

## 0.0.5

### Features

- Basic CSS-in-JS functionality
- Next.js integration
- Static CSS extraction
- Dynamic styles with CSS variables
- Basic styled components API
