# Contributing to next-yak

Thank you for your interest in contributing to next-yak! This document provides guidelines and instructions for contributing to the project.

## Table of contents

- [Development setup](#development-setup)
  - [Prerequisites](#prerequisites)
  - [Initial setup](#initial-setup)
  - [Project structure](#project-structure)
- [Developping `next-yak` TypeScript/JavaScript](#developping-next-yak-typescriptjavascript)
- [Developing `yak-swc` Rust](#developing-yak-swc-rust)
  - [Running the example app](#running-the-example-app)
- [Submitting a pull request](#submitting-a-pull-request)
- [Common issues](#common-issues)
  - [Rust setup issues](#rust-setup-issues)
  - [Build issues](#build-issues)
  - [Test issues](#test-issues)

## Development setup

### Prerequisites

Before you begin

- Install [Node.js](https://nodejs.org/en) v20.x or later
- Install [pnpm](https://pnpm.io/) v9.7.0 or later
- Install [Rust](https://www.rust-lang.org/) toolchain <br />
  **⚠️ Important**<br />
  Do _not_ use brew or other package managers to install Rust, as this can lead to permission issues<br />
  Install Rust from [rust-lang.org](https://www.rust-lang.org/tools/install), following the official instructions for your platform
- Add the Rust WebAssembly target, execute
  ```bash
  rustup target add wasm32-wasip1
  ```

### Initial setup

Clone the repository

```bash
git clone https://github.com/DigitecGalaxus/next-yak.git
cd next-yak
```

Install dependencies

```bash
pnpm install
```

Build everything (required before running examples or tests)

```bash
pnpm run build
pnpm run build:swc
```

### Project structure

The monorepo is organized into several key packages and directories:

The main package

- [next-yak](./packages/next-yak) - TypeScript/JavaScript code for Next.js

Rust packages under `./packages/yak-swc/`:

- [yak-swc](./packages/yak-swc) - SWC plugin, npm package, and Rust library
- [./yak_swc](./packages/yak-swc/yak_swc) - Core SWC plugin implementation in Rust
- [./css_in_js_parser](./packages/yak-swc/css_in_js_parser) - Rust library for parsing CSS-in-JS syntax
- [./relative_posix_path](./packages/yak-swc/relative_posix_path) - Rust utility for path handling

Additional packages

- [benchmark](./packages/benchmark) - CI-benchmarking tool
- [example](./packages/example) - Demo Next.js application, featuring various use cases
- [docs](./packages/docs) - Documentation and playground, hosted at [yak.js.org](https://yak.js.org/)

## Developping `next-yak` TypeScript/JavaScript

The main package is written in TypeScript. The package is responsible for transforming components and serving styles to the module CSS system of Next.js. The TypeScript/JavaScript code is located in the `./packages/next-yak` directory.

Building, from the the `./` or the `./packages/next-yak` directory:

```bash
pnpm build
```

Running the tests

```bash
pnpm test
```

Test watch mode

```bash
pnpm test:watch
```

Updating test snapshots

```bash
pnpm test:snapshots
```

## Developing `yak-swc` Rust

The SWC plugin is written in Rust and compiled to WebAssembly. The plugin is responsible for transforming TypeScript and extracting CSS-in-JS styles from components. The Rust code is located in the `./packages/yak-swc` directory, it's recommended to open the IDE in this directory to work on the SWC plugin.
Opening the IDE in the `./packages/yak-swc` directory will allow the Rust toolchain to work correctly.

Running the scripts from the `./packages/yak-swc` directory:

Build the SWC plugin

```bash
pnpm build
```

Tests for the SWC plugin

```bash
pnpm test
```

For updating test snapshots in the SWC plugin

```bash
pnpm test:snapshots
```

### Running the example app

The example app is a Next.js application that demonstrates the features of `next-yak`. The example app is located in the `./packages/example` directory.

Build everything and start the example app

```bash
pnpm build
pnpm build:swc
pnpm example
```

Debugging the SWC plugin in the example app, you can enable debug logging

```js
// ./packages/example/next.config.mjs
export default withYak({
  experiments: {
    debug: true, // or { filter: (path) => path.includes('component.tsx'), type: 'css' }
  },
});
```

## Submitting a pull request

1. Fork the repository
2. Create a new feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes, following these guidelines:
   - Write tests for new features
   - Follow existing code style
   - Keep commits focused and atomic
   - Write clear commit messages
4. Run tests to ensure everything works
5. Create a changlog entry

   This step is mandatory, if there is no change to
   the public API, you may want to add an empty changeset
   by adding the `--empty` flag.

   ```bash
   pnpm changeset
   ```

6. Push changes and create a pull request

## Common issues

### Rust setup issues

- **Permission problems with Rust**: Make sure to install Rust from [rust-lang.org](https://www.rust-lang.org/tools/install) and not through package managers
- **Missing wasm32-wasip1 target**: Run `rustup target add wasm32-wasip1`
- **Cargo build failures**: Ensure you have the latest stable Rust toolchain with `rustup update stable`

### Build issues

- **SWC plugin not found**: Make sure to run `pnpm build:swc` before starting the example app
- **Missing dependencies**: Run `pnpm install` and ensure all peer dependencies are satisfied

### Test issues

- **Snapshot test failures**: Use `pnpm test:snapshots` to update all snapshots, swc and JavaScript

---

For any questions not covered here, please feel free to [open an issue](https://github.com/jantimon/next-yak/issues/new).
