---
"yak-swc": patch
---

Folding a static styled component into a plain element now drops its `$`-prefixed props, like the runtime does. They no longer reach the DOM, so React stops warning about unknown attributes. A fold to a wrapped component still forwards them - that component may read them for its own class names.
