---
"yak-swc": minor
"next-yak": minor
---

Add JSX folding: usages of styled components declared in the same file are inlined into plain elements at build time, skipping the runtime wrapper component:

```tsx
const Icon = styled.span<{ $active?: boolean }>`
  min-height: 24px;
  ${({ $active }) =>
    $active &&
    css`
      color: red;
    `}
`;
const App = () => <Icon $active={on} />;

// compiles to
const App = () => <span className={"yak-icon" + (on ? " yak-icon--active" : "")} />;
```

- Fully static components fold to the plain DOM element, `styled(Component)` wrappers fold to the wrapped component (which may be imported).
- Class-toggling expressions (`({ $active }) => $active && css`…`` or `(p) => p.$active && css`…``) are inlined by substituting the props with the attribute values; the `$` attributes are dropped like the runtime drops them.
- An existing `className` is merged at compile time, or through the new `__yak_mergeClassNames` helper for runtime values.
- Usages with spread props, `theme`, dynamic css values (css variables) or `.attrs()` keep the runtime path, as do components not declared as top-level `const`.
- The optimization can be disabled with the new `optimizeStaticJsx: false` option.

Behavioral notes: JSX folding speeds up rendering considerably, but a folded usage is no longer a component. It does not show up in React DevTools or in component stacks, in development too, and `child.type === Icon` checks no longer match it. Foreign `$props` on fully static folded usages are forwarded instead of stripped. The FAQ explains when a usage folds and what that changes.

Prop expressions on folded usages must be pure: the value is inlined into every style condition that reads it, and a prop that reaches the DOM is evaluated on the element as well, so `<Button disabled={Math.random() > 0.5} />` can render a button that is disabled while it is styled as enabled. The new `precompute-style-prop-values` rule in `eslint-plugin-yak` reports the values this applies to.
