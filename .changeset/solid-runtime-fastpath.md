---
"@yak/solid": minor
---

Render Solid styled components faster, especially when rendering on the server.

Keep prop and child updates working when reactive spreads or `.attrs()` add or remove values. Style functions can also read values from `.attrs()` when spreading props.

A `component` prop now reaches styled tags like every other prop, matching `next-yak`.

Styled `a`, `script`, `style` and `title` tags no longer read an unused child prop getter on the server. Like Solid, only the first child prop is read.
