---
"yak-swc": minor
"next-yak": minor
---

Add `globalCss` for global styles (resets, `@font-face`, `:root` variables, view transitions). A module-scope tagged template that extracts unscoped CSS at build time and applies as soon as the declaring file is imported, e.g. from the root layout. Constants, `keyframes`, static `css` mixins and styled component selectors can be interpolated (`body:has(${Dialog}[open]) { overflow: hidden }`); runtime interpolations (`${props => ...}`) and usage inside functions are compile errors. Styles are emitted verbatim and cascade against component styles by regular specificity, wrap them in an authored `@layer` block to make component styles always win.
