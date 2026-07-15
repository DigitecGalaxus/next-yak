---
"yak-swc": patch
---

Drop empty css props at build time instead of emitting a dead class name, e.g. `<div css={css``} />` becomes `<div />` and an empty ternary arm folds to `""`. A nested empty `` css`` `` also folds to an empty class name instead of keeping the whole css prop on the runtime merge path.
