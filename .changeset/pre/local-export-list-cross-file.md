---
"@yak/react": patch
---

Resolve cross-file constants, mixins and styled components that are exported with a local export list (`export { x }`, `export { x as y }`, `export { x as default }`) or re-exported from an import.
