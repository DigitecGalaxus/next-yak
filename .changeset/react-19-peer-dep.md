---
"next-yak": minor
---

Declare React >=19 as peer dependency.

The runtime already requires React 19 since 8.0.0 — `useTheme` is built on the `use()` hook (added for async RSC theme contexts in #429), which does not exist in React 18. The peer dependency range just didn't reflect that yet, so React 18 installs would pass `npm install` and then crash at runtime when rendering a themed or dynamic component. This makes the existing requirement explicit.
