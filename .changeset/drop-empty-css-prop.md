---
"yak-swc": patch
---

Drop empty css props at build time instead of emitting a dead class name, e.g. `<div css={css``} />` becomes `<div />` and an empty ternary arm folds to `""`.
