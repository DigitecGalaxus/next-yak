---
"@yak/solid": minor
---

Faster styled components at runtime. Tag targets render with the compiler's own element primitives instead of `Dynamic`, so an element costs no memo and no owner, and a styled element takes the same hydration key an unstyled one would. On the server a tag is serialized in one pass from the author's props, the attrs and the computed class and style. The dynamic path runs attrs and style interpolations in one computation, with a transparent memo on the client and no memo on the server. Component targets receive a plain props object instead of a Proxy.

Hydration keys change with this release, so the server and the client must run the same `@yak/solid` version.
