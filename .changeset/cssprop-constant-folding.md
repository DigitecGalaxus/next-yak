---
"yak-swc": minor
---

Fold statically known css props into a plain `className` at build time instead of emitting a per-render `__yak_mergeCssProp` call, e.g. `<div css={css`color: red`} />` becomes `<div className="yX" />` and conditional styles become `className={"yX" + (on ? " yX1" : "")}`. Elements with an existing `className`, spread props, dynamic values or mixin references keep the runtime merge path unchanged.
