---
"yak-swc": minor
"next-yak": minor
---

Add JSX folding: a usage of a styled component declared in the same file compiles to a plain element, skipping the runtime wrapper. Rendering gets considerably faster, and nothing needs configuring.

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

What folds:

- A fully static component folds to its plain element.
- `styled(Component)` folds to the wrapped component, which may be imported.
- A fully static `styled(Parent)` chain collapses to the base element, at any depth, with the class names merged parent-first. The declaration flattens too, so an exported chain ships one wrapper and its unused base components drop out.

What keeps the runtime path: spread props, a `theme` prop, dynamic css values, `.attrs()`, and components not declared as a top-level `const`. A chain also stays a chain when its parent is dynamic, imported, or bound with `let`.

Set `foldStatic: false` to turn folding off; it also gates the css prop fold.

Caveats: a folded usage is no longer a component, so it does not appear in React DevTools or component stacks, and `child.type === Icon` no longer matches it. Foreign `$props` on a folded usage are forwarded to the element, not stripped. Prop expressions still run the same number of times, in the same order, as the original JSX — except in code React's purity rule already forbids: an unread `$prop` is dropped without running, and a getter behind a member read (`$a={obj.x}`) can fire once per condition. The FAQ has the full rules.
