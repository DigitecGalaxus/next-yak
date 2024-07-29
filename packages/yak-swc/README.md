# yak-swc

This package contains the Rust SWC plugin for [next-yak](https://www.npmjs.com/package/next-yak), a build time CSS-in-JS solution.

## Overview

`yak-swc` is a SWC (Speedy Web Compiler) plugin written in rust to transform the CSS-in-JS code at build time

This package is distributed separately from the main next-yak package to provide flexibility in version management. It needs to be compatible with your project's @swc/core version. By keeping it separate, you can choose the appropriate version that matches your SWC setup.

## Installation

To install the plugin, use npm or yarn:

```bash
npm install yak-swc
# or
yarn add yak-swc
```

Make sure to install a version that is compatible with your project's @swc/core version

## Usage

This plugin is typically configured automatically when you set up next-yak in your Next.js project.
For details please refer to the [next-yak documentation](https://yak.js.org/).

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvements, please open an issue or submit a pull request on the [next-yak GitHub repository](https://github.com/jantimon/next-yak).

## License

This package is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
