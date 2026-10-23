---
"@yak/react": minor
"@yak/swc": minor
---

Constants built from other constants with a template literal now work in styles, in the same file and when imported from another file:

```ts
const GAP = "20px";
export const NEGATIVE_GAP = `-${GAP}`; // -20px

const SPACE = 20;
export const HALF_NEGATIVE_SPACE = `-${SPACE / 2}px`; // -10px
```
