---
"yak-swc": minor
---

The css prop now rejects references to styles declared elsewhere (`css={mixin}`, `css={on && mixin}`, `css={on ? mixin : css`…`}`) with a compile error instead of silently dropping the referenced styles — a mixin only compiles its declarations into template consumers, so these usages rendered unstyled without any signal. Wrap the reference in a css template instead: `css={css`${mixin}`}`. Inline templates in ternary and logical arms are unaffected.
