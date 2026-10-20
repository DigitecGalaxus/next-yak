---
"@yak/react": minor
---

Report invalid CSS in yak templates as build errors that show the source line.

Before, yak dropped or moved this CSS without an error, or crashed:

- a `}` with no matching `{`
- a `{` with no selector before it
- a declaration with no `:`, like `color red;`
- a selector or media query that comes from a runtime value, like `${media.up("md")} {`
- a string constant with a whole declaration or rule, like `const reset = "margin: 0;"`
- a `(` or `{` that is never closed, like `@media (min-width: 600px {`

Also fix `&:hover { color: blue }` without a semicolon. Yak applied `color: blue` without the hover.
