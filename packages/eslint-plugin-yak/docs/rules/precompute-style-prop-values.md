# yak/precompute-style-prop-values

📝 Enforces that prop values read by several style conditions are computed once and passed as a variable.

<!-- end auto-generated rule header -->

Warns when a prop value is evaluated more than once because next-yak inlines the component into the place where it is used.

## Reason why

next-yak inlines a styled component into its usage at build time, which removes the wrapper component from the React tree. To do that it copies the value of a prop into every style condition that reads it:

```tsx
const Sticker = styled.div<{ $tilt: number }>`
  ${(p) => p.$tilt > 5 && css`transform: rotate(3deg);`}
  ${(p) => p.$tilt > 8 && css`box-shadow: 0 0 8px black;`}
`;

const App = () => <Sticker $tilt={Math.random() * 10} />;

// compiles to
const App = () => (
  <div
    className={
      "Sticker_a1" +
      (Math.random() * 10 > 5 ? " Sticker_a2" : "") +
      (Math.random() * 10 > 8 ? " Sticker_a3" : "")
    }
  />
);
```

Each condition rolls its own number, so the sticker can get the shadow without the rotation, even though a tilt above 8 is always above 5. That is a combination the component could never render on its own.

A prop that reaches the DOM is also kept on the element, so it is evaluated there as well:

```tsx
const Button = styled.button`
  ${({ disabled }) => disabled && css`opacity: 0.5;`}
`;

const App = () => <Button disabled={Math.random() > 0.5} />;

// compiles to a button which can be disabled while it is styled as enabled
const App = () => (
  <button
    disabled={Math.random() > 0.5}
    className={"Button_b1" + (Math.random() > 0.5 ? " Button_b2" : "")}
  />
);
```

A single condition can read a prop twice as well, which inlines it twice on its own:

```tsx
// $size is evaluated twice, once for each read
${({ $size }) => $size && $size === "big" && css`padding: 8px;`}
```

## How to fix it

Compute the value once and pass the result. An identifier is only read, never evaluated again, so the component is still inlined:

```tsx
const App = () => {
  const tilt = Math.random() * 10;
  return <Sticker $tilt={tilt} />;
};
```

## When the rule reports

The rule only reports values that next-yak may evaluate more than once, which means all of the following:

- The styled component is declared in the same file as the usage. Imported components are never inlined, as the compiler sees one file at a time.
- It is declared as a top level `const` and is not an `.attrs()` chain.
- Every interpolation is a class condition. A value compiled into a css variable keeps every usage on the runtime path.
- The conditions destructure their props plainly. A rename, a default value or a rest element is not substituted, so those keep the runtime path too.
- No condition reads `theme`, `children`, `className`, `style` or `key`. The runtime passes those separately, so reading one keeps the runtime path.
- The usage has no spread and no `theme` prop.
- The prop is read by a style condition, and the value is not a literal, an identifier or a member expression.

Pure values like `Math.max(4, s)` are reported too. Evaluating them twice is harmless, but precomputing keeps the generated code smaller, so the fix is worth applying either way.

The rule matches these shapes syntactically and is a best effort mirror of the compiler. It errs towards staying quiet rather than reporting a value that would never be inlined.
