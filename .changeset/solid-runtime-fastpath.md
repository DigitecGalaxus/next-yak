---
"@yak/solid": minor
---

Render Solid styled components faster, especially when rendering on the server.

Keep prop and child updates working when reactive spreads or `.attrs()` add or remove values. Style functions can also read values from `.attrs()` when spreading props.

A `component` prop now reaches styled tags like every other prop, matching `next-yak`.

Styled `a`, `script`, `style` and `title` tags no longer read an unused child prop getter on the server. Like Solid, only the first child prop is read.

Those four tags render through the same path as every other tag instead of Solid's `dynamic()`: one server writer, one client binder; a fresh mount creates them as html elements, as Solid's own `Dynamic` does since 2.0.0-rc.8. Hydration keys change, so server and client must run the same `@yak/solid` version.

Adjacent text children of a styled tag get the same separator marker on the server that compiled Solid templates emit, so the client claims them as separate text nodes during hydration.

A styled component target that merges its props with `merge()` keeps the generated class and never sees `$` props: yak no longer forwards Solid's private merge marker.

Chained `.attrs()` layers no longer read the author's child and prop getters while combining attrs, so a child component renders once and hydration keys match.

A styled `textarea` renders its `value` as content on the server, as Solid's own elements do since 2.0.0-rc.8. A styled `script` or `style` with only children keeps its content raw on the server, as it does with other props. `@yak/solid` now requires Solid 2.0.0-rc.8; an app that bundles `@yak/solid` on the server (`ssr.noExternal`) must bundle `solid-js`, `@solidjs/web` and `@solidjs/signals` too, or Solid's `development` export condition loads a second server build.

Object-form `.attrs()` with plain attribute values (strings, numbers, booleans) on a styled tag renders through the static path: the attributes are read once when the component is defined and become part of the tag's opening string and template, so such a component costs no memo or proxy per element. They appear before the author's attributes in the markup. Keys that are not plain attribute names, keys Solid applies as DOM properties (`value`, `checked`, `selected`, `muted` and their `default*` forms), getters, and `class`, `style` or `theme` keep the dynamic path.
