---
"@yak/solid": minor
---

Faster styled components, especially on the server. Requires Solid 2.0.0-rc.8; an app that bundles `@yak/solid` for SSR (`ssr.noExternal`) must bundle Solid too.

- Object-form `.attrs()` with plain values is baked into the tag at definition, so such components render on the static path
- `a`, `script`, `style` and `title` render like every other tag; hydration keys change, so server and client need the same `@yak/solid` version
- Fixes: `merge()` on a component target keeps the generated class and sees no `$` props; chained `.attrs()` render a child once; a `textarea` renders its `value` as content; `script` and `style` content stays raw; a `component` prop reaches styled tags; the untransformed `styled` export no longer breaks `await`
