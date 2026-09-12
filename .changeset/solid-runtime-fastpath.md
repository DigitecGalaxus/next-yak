---
"@yak/solid": minor
---

Render Solid styled components faster, especially when rendering on the server.

Keep prop and child updates working when reactive spreads or `.attrs()` add or remove values. Style functions can also read values from `.attrs()` when spreading props.

A `component` prop now reaches styled tags like every other prop, matching `next-yak`.

Styled `a`, `script`, `style` and `title` tags no longer read an unused child prop getter on the server. Like Solid, only the first child prop is read.

Those four tags render through the same path as every other tag instead of Solid's `dynamic()`: one server writer, and on the client a fresh mount picks the html or svg namespace from the element it is inserted into. Hydration keys change, so server and client must run the same `@yak/solid` version.

Adjacent text children of a styled tag get the same separator marker on the server that compiled Solid templates emit, so the client claims them as separate text nodes during hydration.

A styled component target that merges its props with `merge()` keeps the generated class and never sees `$` props: yak no longer forwards Solid's private merge marker.

Chained `.attrs()` layers no longer read the author's child and prop getters while combining attrs, so a child component renders once and hydration keys match.

Object-form `.attrs()` with plain attribute values (strings, numbers, booleans) on a styled tag renders through the static path: the attributes are read once when the component is defined and become part of the tag's opening string and template, so such a component costs no memo or proxy per element. They appear before the author's attributes in the markup. Keys Solid applies as DOM properties (`value`, `checked`, `selected`, `muted` and their `default*` forms), getters, and `class`, `style` or `theme` keep the dynamic path.
