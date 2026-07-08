---
"yak-swc": patch
---

Fix a stray `/*#__PURE__*/` on inlined `css` mixins that could make a bundler tree-shake away an entire export under the wasm plugin