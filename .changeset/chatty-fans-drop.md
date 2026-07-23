---
"next-yak": minor
---

Improve runtime render performance by collecting class names via string append instead of Set round-trips, rendering styled() composition chains as a single wrapper and skipping prop/style processing entirely for static components

Components with fully static styles no longer receive a default `style: {}` prop, and a user-passed `style` object is forwarded by reference instead of cloned on every render; components with dynamic styles are unchanged.
