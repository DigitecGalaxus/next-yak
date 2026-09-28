---
"@yak/solid": minor
---

Re-home props getters instead of moving them when `copyProps` / `combineProps` copy descriptors. solid-js 2.0.0-rc.10 compiles a props literal with getters into a hoisted constructor whose getters read their captured values through `this` (`hoistProps`, default on), so a descriptor moved onto another object read nothing. A copied accessor now reads the source object; data descriptors are unchanged.
