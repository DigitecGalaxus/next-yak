---
"yak-swc": patch
---

Emit the default-export marker for styled components exported through a TS cast (e.g. `export default Page as typeof Page`) so cross-file default imports resolve correctly
