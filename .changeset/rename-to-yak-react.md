---
"@yak/react": major
"@yak/swc": major
"@yak/storybook": major
---

Rename `next-yak` to `@yak/react`. Change your imports from `next-yak` to `@yak/react`, for example `@yak/react/withYak` and `@yak/react/vite`. To type the theme, use `declare module "@yak/react"`. `yak-swc` is now `@yak/swc`, and `storybook-addon-yak` is now `@yak/storybook`, with `@yak/react` as its peer dependency. `next-yak` 9.x stays available for fixes.
