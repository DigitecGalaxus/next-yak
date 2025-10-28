---
"next-yak": major
"yak-swc": major
---

Add support for Next.js 16 with webpack compatibility

This release adds full support for Next.js 16.0.0 while maintaining compatibility with the existing webpack-based build system.

**Breaking Changes:**

- Updated minimum Next.js version requirement to >= 16.0.0
- Upgraded swc_core from 38.0.1 to 45.0.1

**Important Notes:**

- Next.js 16 defaults to Turbopack, but next-yak currently requires webpack
- All development and build scripts have been updated to use webpack explicitly
- Turbopack support is planned for future releases

**Migration Guide:**
When upgrading to Next.js 16, ensure you use the `--webpack` flag:

```bash
next dev --webpack
next build --webpack
```

Or use the updated package scripts that include this flag automatically.
