# next-yak

[Documentation](https://yak.js.org/docs/getting-started) and [Playground](https://yak.js.org/playground), hosted at [yak.js.org](https://yak.js.org/)

![A yak Riding on a rusty SWC Rocket](https://github.com/user-attachments/assets/72494b1c-db1a-4ff7-bd6f-2ed3535fb126)

[![npm version](https://badge.fury.io/js/next-yak.svg)](https://www.npmjs.com/package/next-yak)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/jantimon/next-yak/blob/main/LICENSE)

**next-yak** is a CSS-in-JS solution tailored for [Next.js](https://nextjs.org/) that seamlessly combines the expressive power of styled-components syntax with efficient build-time extraction of CSS using Next.js's built-in CSS configuration.

## Features

- **NextJs Compatibility**: Works smoothly with both React Server and Client Components
- **Build-time CSS**: Reduces load time by handling CSS during the build phase, using Next.js built-in CSS Modules features
- **Lightweight Runtime**: Operates with minimal impact, simply changing CSS classes without modifying the CSSOM
- **Standard CSS Syntax**: Write styles in familiar, easy-to-use CSS
- **Integrates with Atomic CSS**: Easily combines with atomic CSS frameworks like Tailwind CSS for more design options

[Preview (Video)](https://github.com/jantimon/next-yak/assets/4113649/f5a220fc-2a0f-46be-a8e7-c855f7faa337)

## Compatibility

| next-yak         | Next.js         | react            | swc_core         | 
|------------------|-----------------|------------------|------------------|
| 5.x              | >= 15.2.1       | 19.x             | 16.0.0           |
| 4.x              | >= 15.0.4       | 19.x             | 5.0.1            |
| 3.x              | 15.x            | 18.x / 19.x      | 3.0.2            |
| 2.x              | 14.x            | 18.x / 19.x      | 0.279.0          |

## Installation

```bash
# For Next.js >= 15.2.1
npm install next-yak

# For Next.js 14.x 
npm install next-yak@2
```

## Getting Started

See a live [stackblitz demo](https://stackblitz.com/edit/stackblitz-starters-dfykqy?file=app%2Fpage.tsx) or try our **[stackblitz starter kit](https://stackblitz.com/fork/next-yak-starter?file=app%2Fpage.tsx)**

### Locally

1. Install **next-yak** in your Next.js project.

2. Add next-yak to your `next.config.mjs`:

```js
// next.config.js
import { withYak } from "next-yak/withYak";

const nextConfig = {
  // your next.js config
};

export default withYak(nextConfig);
```

3. Ready to go:

```jsx
// pages/index.js
import { styled } from "next-yak";

const StyledDiv = styled.div`
  color: #333;
  padding: 16px;
  background-color: #f0f0f0;
`;

function HomePage() {
  return <StyledDiv>Hello, next-yak!</StyledDiv>;
}

export default HomePage;
```

## More Examples

### Dynamic Styles

Dynamic Styles will only toggle the css class during runtime:

```jsx
import { styled, css } from "next-yak";

const ToggleButton = styled.button`
  ${(props) =>
    props.$active
      ? css`
          background-color: green;
        `
      : css`
          background-color: lime;
        `};
  color: white;
  padding: 10px 20px;
`;
```

[Dynamic Styles (Video)](https://github.com/jantimon/next-yak/assets/4113649/c5f52846-33e4-4058-9c78-efd98197d75f)

### Dynamic Properties

Dynamic Properties use custom properties ([aka css variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)) under the hood to extract the CSS at built time but modify properties at runtime:

```jsx
import { styled } from "next-yak";

const ProgressBar = styled.div`
  width: ${(props) => `${props.$percent}%`};
  height: 20px;
  background-color: #3498db;
  transition: width 0.3s ease-in-out;
`;

const ProgressBarContainer = styled.div`
  border: 1px solid #ccc;
`;

const ExampleComponent = () => {
  const progress = 75; // You can dynamically set this value

  return (
    <ProgressBarContainer>
      <ProgressBar $percent={progress} />
    </ProgressBarContainer>
  );
};
```

[Dynamic Props (video)](https://github.com/jantimon/next-yak/assets/4113649/2fa78f82-382c-465f-b294-2504739ea168)

### Targeting Components

In next-yak, you can target other components directly using CSS selectors as long as they are **in the same file**:

```jsx
import { styled, keyframes } from "next-yak";

const flip = keyframes`
  from { transform: rotateY(0deg); }
  to { transform: rotateY(360deg); }
`;

const Glow = styled.div`
  /* Add your Glow component styles here */
`;

const Text = styled.span`
  display: inline-block;
  ${Glow}:hover & {
    animation: 1.5s ${flip} ease-out;
  }
`;

const ExampleComponent = () => {
  return (
    <Glow>
      <Text>This text will flip on hover.</Text>
    </Glow>
  );
};
```

## Nesting

`next-yak` supports nesting out of the box.
[For now](https://github.com/css-modules/postcss-modules-local-by-default/pull/64) Next.js 13 supports nesting only with the `postcss-nested` plugin.
Therefore you have to create a `postcss.config.js` file in your project root:

```js
// postcss.config.js
module.exports = {
  plugins: {
    "postcss-nested": {},
  },
};
```

[Nesting Example (video)](https://github.com/jantimon/next-yak/assets/4113649/33eeeb13-b0cf-499f-a1d3-ba6f51cf4308)

## Motivation

Most of the existing CSS-in-JS libraries are either slow or have a complex api. This project tries to find a middle ground between speed and api complexity.

The goal of this project is to create a proof of concept for a CSS-in-JS library that has the following properties:

- fast
  - no runtime
  - can be statically extracted
  - can be optimized by postcss
  - no processing during hydration
  - can make use of [103 early hints](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/103)
- api
  - ui colocation (mixing css and jsx)
  - familiar `styled.div` api
  - composable `styled(Component)`
  - allows conditional styles
  - allow to use props in styles
  - allow to use a context based theme in styles
  - typescript support

Optimizations are done by postcss. This allows to use the full power of postcss and its plugins. It also allows to use the same optimizations for css files and css-in-js.

## Performance Gains

[![CSS Extract](https://raw.githubusercontent.com/jantimon/next-yak/main/css-extract.gif)](https://raw.githubusercontent.com/jantimon/next-yak/main/css-extract.gif)

## How it works

next-yak converts css-in-js into css modules. This allows to use the full power of postcss and its plugins. It also allows to use the same optimizations for css files and css-in-js.

[![Compile Flow](https://raw.githubusercontent.com/jantimon/next-yak/main/compile-flow.webp)](https://raw.githubusercontent.com/jantimon/next-yak/main/compile-flow.webp)

## Atomic CSS

`next-yak` ships with atomic css support
So you can use [tailwind](https://tailwindcss.com/) out of the box without additonal configuration.

```tsx
import { styled, atoms } from "next-yak";

// Mixing tailwind with custom styles
const Icon = styled.p`
  ${atoms("font-bold")}
  @supports (initial-letter: 2) {
    initial-letter: 2;
  }
`;

// Apply tailwind classes conditionally
const Button = styled.button`
  ${({ $primary }) =>
    $primary
      ? atoms(
          "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        )
      : atoms(
          "bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        )}
`;
```

## Build Time Constants

The downside of dynamic properties is that they require inline style attributes.
While this is not a problem for most cases, we can't use them for media queries.

`next-yak` allows you to define build time constants which can be used in your styles:

```jsx
import { styled } from "next-yak";
import { breakpoints, spacings } from "./constants.yak";

const Container = styled.div`
  padding: ${spacings.md};
  ${breakpoints.md} {
    padding: ${spacings.lg};
  }
`;
```

| Feature        | Code                        | Yak Constant files                      |
| :------------- | :-------------------------- | :-------------------------------------- |
| File Extension | `.js`, `.jsx`, `.tsx`, etc. | `.yak.js`, `.yak.jsx`, `.yak.tsx`, etc. |
| Runs at        | Runtime (Node or Browser)   | Compile time (Bundler)                  |
| Side effects   | ✅                          | 🚫                                      |
| Yak Features   | All (`styled`, `css`, ...)  | 🚫                                      |

[Build time constants (video)](https://github.com/jantimon/next-yak/assets/4113649/2c83246c-a03b-4c57-8814-32a7248983ac)

## Yak shaving

While trying to get next-yak to work properly we stumbled accross several bugs.
Thanks for merging our prs fixes in next.js, webpack and postcss ❤️

<details>
  <summary>PRS</summary>

- https://github.com/vercel/next.js/pull/51115 (fix inline matchResource `!=!`)
- https://github.com/vercel/next.js/pull/53796 (fix inline matchResource `!=!`)
- https://github.com/css-modules/postcss-modules-local-by-default/pull/64 (fix css nesting)
- https://github.com/css-modules/postcss-modules-local-by-default/pull/72 (fix css nesting)
- https://github.com/css-modules/postcss-modules-local-by-default/pull/78 (add cssmodules-pure-ignore)
- https://github.com/css-modules/postcss-modules-local-by-default/pull/85 (add cssmodules-pure-no-check)
- https://github.com/vercel/next.js/pull/62644 (upgrades postcss-modules-local-by-default for css nesting)
- https://github.com/webpack-contrib/mini-css-extract-plugin/pull/1084 (fix: improve esMododule exports)
- https://github.com/vercel/next.js/pull/62639 (enable esmodule optimizations for css modules)
- https://github.com/vercel/next.js/pull/62733 (Minify post css class names in production)
- https://github.com/vercel/next.js/pull/64551 (fix lightningcss-loader)
- https://github.com/vercel/next.js/pull/72622 (upgrades postcss-modules-local-by-default for keyframes)
- https://github.com/webpack/webpack/pull/19012 (CSS Order without side effects)
- https://github.com/swc-project/swc/issues/3934 (Browser SWC Plugin support)
- https://github.com/parcel-bundler/lightningcss/issues/889 (add cssmodules-pure-no-check)

[![nexrt-yak-yak-shaving](https://github.com/user-attachments/assets/720ffc22-d61a-45de-a689-5536160ef079)](https://en.wiktionary.org/wiki/yak_shaving)


</details>

<details>
  <summary>Experiments</summary>
  Incomplete work in progress experiments to test the features and performance of next-yak:

- https://next-yak-benchmark.vercel.app/
- https://yacijs.vercel.app/
</details>

## Acknowledgments

Massive kudos to:

- @sokra: For guiding us through the webpacks module and loader APIs
- @kdy1: For his support while rewriting our Babel plugin as a blazing fast SWC Rust WASM plugin

Special thanks to the contributors and the inspiring projects that influenced next-yak:

- Styled-Components 💅: For pioneering the styled syntax and redefining styling in the React ecosystem.
- Linaria: For its innovative approach to zero-runtime CSS in JS and efficient styling solutions.
- Emotion: For pushing the boundaries of CSS-in-JS and providing a high-performance styling experience.
- Vanilla Extract: For its focus on type-safe, zero-runtime CSS and contributing to the evolution of styling techniques.
- Tailwind CSS: For its exceptional atomic CSS approach, enabling efficient and customizable styling solutions.

## License

**next-yak** is licensed under the [MIT License](https://github.com/jantimon/next-yak/blob/main/packages/next-yak/LICENSE).

## Contributing

Contributions are welcome!

The [contributing guide](https://github.com/jantimon/next-yak/blob/main/CONTRIBUTION.md) helps you get started with setting up the development environment and explains the development workflow

---

Feel free to reach out with any questions, issues, or suggestions!
