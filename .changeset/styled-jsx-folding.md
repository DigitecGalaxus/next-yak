---
"yak-swc": minor
"next-yak": minor
---

Fold JSX usages of styled components declared in the same file into plain elements at build time, skipping the runtime wrapper component:

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

Behavioral notes: a folded usage renders the native element directly, so `child.type === Icon` checks don't match it and toggling between a folded and non-folded usage of the same component remounts instead of updating. Foreign `$props` on fully static folded usages are forwarded instead of stripped.
