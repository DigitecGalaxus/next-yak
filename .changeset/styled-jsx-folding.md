---
"yak-swc": minor
"next-yak": minor
---

Fold JSX usages of fully static styled components declared in the same file into plain DOM elements at build time, e.g. `const Card = styled.div`color: red`;` with `<Card>hi</Card>` becomes `<div className="yX">hi</div>`, skipping the runtime wrapper component entirely. The declaration is kept for exports, selectors and non-foldable usages and is dead-code eliminated by the minifier when unused. An existing `className` is merged at compile time for string literals or through the new `__yak_mergeClassNames` runtime helper for expressions. Usages with spread props, a `theme` prop, dynamic styles, `.attrs()` or a non-native element keep the runtime path. Note: foreign `$`-prefixed props on folded usages are now forwarded to the DOM element instead of being filtered by the runtime.
