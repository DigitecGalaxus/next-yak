---
"next-yak": minor
---

The runtime no longer deduplicates class names, so the same class applied twice — e.g. an `atoms()` utility that is already on the element, or a shared `css` block toggled by two conditions — now appears twice in the class attribute. This is rendering-neutral, as CSS applies a class once however often it is listed.
