---
"yak-swc": patch
---

A `className` string next to a `css` prop kept its JSX encoding: `className="Food &amp; Drink"` rendered the entity into the DOM class, and a backslash class like `before:content-['\2713']` broke the build with a SyntaxError. The value now reaches the DOM exactly as written.
