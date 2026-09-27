---
"@yak/solid": minor
---

The props a styled target receives are now built from Solid's own primitives instead of a hand-written copy or proxy. The author's props go in as `omit(props, skip)` (the skip predicate hides `$`-props, the provider theme, and the keys attrs bake), the attrs a function `.attrs()` produced as a function source, and the computed `class`/`style` as the last source. A tag target spreads that source list directly (`spread(el, [rest, attrs, extras])`, the form a compiled `<tag {...a} {...b}>` takes); a component target receives them as one `merge()` view. Always a view, never a copy — a getter like `icon={<Icon />}` is read by the target in its own order, once. Requires `solid-js` / `@solidjs/web` 2.0.0-rc.10 or newer (`omit()` with a predicate, lazy views).
