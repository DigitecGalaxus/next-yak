---
"next-yak": minor
---

Improve runtime render performance by collecting class names via string append instead of Set round-trips, rendering styled() composition chains as a single wrapper and skipping prop/style processing entirely for static components
