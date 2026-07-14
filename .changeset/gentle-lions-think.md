---
"eslint-plugin-yak": patch
---

Track CSS parser state in `style-conditions` to decide whether an interpolation is a declaration value

The rule used to guess declaration values by checking whether the preceding quasi ends with a colon. It now replays the template's CSS the way yak-swc does, which changes reporting in both directions:

- No longer reported: class references outside declaration values, e.g. `${({ $active }) => $active && activeStyles}`, and interpolations inside at-rule queries (yak-swc already rejects those with a dedicated error).
- Newly reported: declaration values the colon heuristic missed, such as values nested in `var()` / `calc()` and inside quoted strings.
