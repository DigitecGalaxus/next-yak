---
"yak-swc": patch
"next-yak": patch
---

Add a `strictCssProp` option (default `true`) that fails the build on a `css` prop next-yak can't handle. Turn it off to leave unrecognized `css` props untouched, e.g. when another library on the same element uses its own `css` prop. Invalid `css` props are now left in place rather than silently stripped.
