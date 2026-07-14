---
"next-yak": patch
---

Fix the css prop dropping spread props: `<div css={css`...`} {...props} />` now forwards `onClick`, `aria-*` and every other prop to the element instead of keeping only `className` and `style`.
