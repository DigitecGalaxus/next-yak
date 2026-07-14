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

A folded usage evaluates every prop expression the same number of times, and in the same order, as the unfolded JSX did: a value the fold cannot inline for free is bound once at the usage site and the conditions read the binding. Two exceptions are worth knowing, and both only show up in code React's own purity rule already forbids: a `$prop` no style condition reads is dropped without being evaluated, and a getter on a member read (`$a={obj.x}`) can still fire once per condition.
