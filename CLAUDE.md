# CLAUDE.md

This file provides guidance for Claude Code when working with the next-yak repository.

## Project Overview

next-yak is a CSS-in-JS solution for Next.js that combines styled-components syntax with build-time CSS extraction. It uses an SWC plugin (written in Rust) to transform TypeScript/JavaScript and extract CSS at compile time.

## Repository Structure

```
next-yak/
├── packages/
│   ├── next-yak/          # Main TypeScript/JavaScript package
│   ├── yak-swc/           # SWC plugin (Rust → WASM)
│   │   ├── yak_swc/       # Core SWC plugin implementation
│   │   ├── css_in_js_parser/  # CSS-in-JS parser library
│   │   └── relative_posix_path/  # Path utility
│   ├── eslint-plugin-yak/ # ESLint plugin
│   └── example/           # Next.js example (symlinked to examples/next-js)
├── examples/
│   ├── next-js/           # Next.js example app
│   └── vite/              # Vite example app
├── docs/                  # Documentation site (yak.js.org)
├── cross-file-tests/      # Cross-file transformation tests
└── benchmarks/            # Performance benchmarks
```

## Common Commands

All commands use **pnpm** (v10.15.0+). Run from the repository root unless specified.

### Building

```bash
# Build the main next-yak TypeScript package
pnpm build

# Build the Rust SWC plugin (compiles to WASM)
pnpm build:swc

# Build everything (required before first run)
pnpm build && pnpm build:swc
```

### Testing

```bash
# Run all tests (builds first)
pnpm test

# Run tests in watch mode
pnpm test:watch

# Update test snapshots (both JS and Rust)
pnpm test:snapshots
```

### Running Examples

```bash
# Run Next.js example (requires build first)
pnpm example

# Run Vite example
pnpm example:vite

# Run documentation site
pnpm docs
```

### Package-Specific Commands

```bash
# Build only yak-swc WASM
cd packages/yak-swc && pnpm build:yak

# Run Rust tests only
cd packages/yak-swc && pnpm test

# Update Rust test snapshots
cd packages/yak-swc && pnpm test:snapshots

# Format Rust code
cd packages/yak-swc && pnpm prettier
```

## Key Files

### TypeScript/JavaScript (packages/next-yak/)
- `loaders/vite-plugin.ts` - Vite plugin implementation
- `loaders/webpack-loader.ts` - Webpack loader
- `loaders/turbo-loader.ts` - Turbopack loader
- `withYak/index.ts` - Next.js config wrapper
- `cross-file-resolver/` - Cross-file constant resolution

### Rust (packages/yak-swc/yak_swc/src/)
- `lib.rs` - Main SWC plugin entry point and visitor
- `plugin.rs` - WASM plugin wrapper
- `naming_convention.rs` - CSS class/variable naming
- `yak_transforms.rs` - Transformation implementations
- `yak_imports.rs` - Import tracking
- `variable_visitor.rs` - Variable/constant tracking

### Configuration
- `pnpm-workspace.yaml` - Workspace configuration with version catalogs
- `packages/yak-swc/Cargo.toml` - Rust dependencies

## Development Workflow

1. **After pulling changes**: Run `pnpm install` then `pnpm build && pnpm build:swc`

2. **When modifying Rust code**:
   - Run `cargo test` in `packages/yak-swc/yak_swc` for quick iteration
   - Run `pnpm build:swc` to rebuild the WASM plugin for integration testing
   - The WASM target is `wasm32-wasip1`

3. **When modifying TypeScript**:
   - Run `pnpm build` to rebuild
   - Use `pnpm watch` for automatic rebuilds

4. **Testing changes**:
   - Use the examples (`pnpm example` or `pnpm example:vite`) to verify
   - Run `pnpm test` for the full test suite

## SWC Fixture Tests

The SWC plugin uses fixture-based snapshot testing located in `packages/yak-swc/yak_swc/tests/fixture/`.

### How It Works

Tests are auto-generated from fixture directories using `#[testing::fixture("tests/fixture/**/input.tsx")]` macro in `lib.rs`. Each fixture directory contains:

```
fixture/
├── my-test-case/
│   ├── input.tsx              # Input file (required)
│   ├── output.dev.tsx         # Dev mode output (generated)
│   ├── output.prod.tsx        # Prod mode output (generated)
│   ├── output.turbo.dev.tsx   # Turbopack dev output (generated)
│   └── output.turbo.prod.tsx  # Turbopack prod output (generated)
```

### Adding a New Test

1. Create a new directory: `mkdir tests/fixture/my-new-test`
2. Create `input.tsx` with your test case
3. Run `pnpm test:snapshots` to generate output files
4. Review the generated outputs

### Running Tests

```bash
# Run all Rust tests (from packages/yak-swc)
cargo test

# Run specific fixture test
cargo test my_test_name

# Update snapshots when output changes
pnpm test:snapshots

# Or using cargo directly with UPDATE flag
UPDATE=1 cargo test
```

### Test Configurations

Each fixture generates 4 tests:
- `fixture_dev` - Development mode with CSS modules
- `fixture_prod` - Production mode with CSS modules
- `fixture_dev_turbo` - Development mode with Turbopack (DataUrl)
- `fixture_prod_turbo` - Production mode with Turbopack (DataUrl)

## Architecture Notes

### SWC Plugin Flow
1. SWC passes AST to `TransformVisitor` in `lib.rs`
2. Visitor identifies styled-components/CSS template literals
3. CSS is extracted and transformed based on `CssDependencyMode`:
   - `InlineMatchResource` - Webpack inline resource syntax
   - `DataUrl` - Base64 encoded CSS (Turbopack)
   - `Custom` - Configurable import specifier (Vite)
4. JavaScript is transformed to reference generated CSS classes

### Vite Plugin
- Uses virtual modules (`virtual:yak-css:*`) for CSS
- The `{{__MODULE_PATH__}}` placeholder in import specifiers is replaced by the Rust plugin with the actual file path
- CSS is resolved and bundled by Vite's CSS pipeline

## Debugging

Enable debug logging in Next.js config:
```js
export default withYak({
  experiments: {
    debug: true,  // or regex like 'component.tsx.css$'
  },
});
```

For Vite, debug logs are controlled the same way via plugin options.

## Prerequisites

- Node.js >= 24
- pnpm >= 10.15.0
- Rust toolchain (install from rust-lang.org, not brew)
- WASM target: `rustup target add wasm32-wasip1`
