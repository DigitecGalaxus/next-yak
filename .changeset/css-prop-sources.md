---
"next-yak": patch
"yak-swc": patch
"@yak/solid": patch
---

A css prop combined with a spread hydrates on Solid. The compiler now calls `__yak_mergeCssProp` with the css value first and one argument per merged source in JSX order instead of spreading them into one object at the call site. The Solid helper copies the sources' property descriptors without reading them and resolves `class` and `style` where they are read, so no prop getter runs before the element takes its hydration key, and the class binding stays live.
