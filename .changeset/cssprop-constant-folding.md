---
"yak-swc": minor
---

Fold statically known css props into a plain `className` at build time instead of emitting a per-render `__yak_mergeCssProp` call, e.g. `<div css={css`color: red`} />` becomes `<div className="yX" />` and conditional styles become `className={"yX" + (on ? " yX1" : "")}`. Elements with an existing `className`, spread props or dynamic values keep the runtime merge path unchanged, as does every css prop when `foldStatic: false`; a css prop that references a mixin is a compile error.
