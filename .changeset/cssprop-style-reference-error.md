---
"yak-swc": minor
---

The css prop now rejects a reference to styles declared elsewhere (`css={mixin}`) with a compile error. Wrap the reference in a css template instead: `css={css`${mixin}`}`. Such a reference compiles to nothing at the usage, so it silently rendered unstyled.
