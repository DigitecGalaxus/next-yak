# @yak/swc

The Rust SWC plugin of [yak](https://yak.js.org/), the zero-runtime CSS-in-JS library. Both [@yak/react](https://www.npmjs.com/package/@yak/react) and [@yak/solid](https://www.npmjs.com/package/@yak/solid) use it to compile styled components to plain CSS at build time.

![A yak Riding on a rusty SWC Rocket](https://github.com/user-attachments/assets/548ed098-fad3-4991-938d-e67607fb1851)

## Overview

`@yak/swc` is an SWC (Speedy Web Compiler) plugin written in Rust. It transforms the CSS-in-JS code at build time.

This package is distributed separately from the runtimes to keep its version flexible. It needs to be compatible with your project's @swc/core version. By keeping it separate, you can choose the appropriate version that matches your SWC setup.

## Installation

To install the plugin, use npm or yarn:

```bash
npm install @yak/swc
# or
yarn add @yak/swc
```

Make sure to install a version that is compatible with your project's @swc/core version.

## Usage

The yak bundler plugins for Next.js, Vite and Rsbuild set up this plugin for you. For details, see the [yak documentation](https://yak.js.org/).

## Contributing

Contributions are welcome!

The [contributing guide](https://github.com/galaxuslabs/yak/blob/main/CONTRIBUTION.md) helps you get started with setting up the development environment and explains the development workflow.

If you encounter any issues or have suggestions for improvements, please open an issue or submit a pull request on the [yak GitHub repository](https://github.com/galaxuslabs/yak).

## License

This package is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
