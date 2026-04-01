# Next.js Example

Example Next.js app using next-yak for CSS-in-JS. Works with both **Webpack** and **Turbopack**.

## Getting Started

```bash
# From the repository root
pnpm install
pnpm build && pnpm build:swc
pnpm example
```

## Key Files

- `next.config.ts` - next-yak configuration via `withYak`
- `app/` - App Router pages and components using `styled`, `css`, and `keyframes`
- `yak.context.ts` - Theme context configuration

## Documentation

See the full docs at [yak.js.org](https://yak.js.org/docs/getting-started).
