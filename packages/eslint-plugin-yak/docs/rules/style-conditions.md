# Enforces that arrow functions only return runtime values or css literals in styled/css literals from next-yak (`yak/style-conditions`)

💭 This rule requires [type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->

Warns if runtime performance could be improved by using css literals.

## Reason why

next-yak offers two different approaches for implementing dynamic styles, each with its own use cases and performance characteristics.

1. Class-based Dynamic Styles

The first approach compiles dynamic styles into separate CSS classes that are toggled at runtime:

```tsx
styled.button<{$primary?: boolean}>`
  color: blue;
  ${({$primary}) => $primary && css`
    color: red;
  `}
`;
```

In this example:
- The base style color: blue is extracted into a CSS class that's always applied
- The conditional style color: red is extracted into a separate CSS class that's only toggled based on the $primary prop
- This approach is highly efficient since all styles are pre-compiled and only class names are manipulated at runtime

2. CSS Variables for Truly Dynamic Values

The second approach uses CSS custom properties (variables) for values that cannot be determined at build time:

```tsx
styled.div<{$x: number}>`
  left: ${({$x}) => `${$x}px`}
`;
```

In this example:
- The value for $x is extracted into a CSS variable (e.g., --x)
- At runtime, this variable is set via inline styles: <div style="--x: 43px">...</div>
- This allows for fully dynamic values but adds a small runtime overhead

## Best Practices

- Use the class-based approach (first example) for binary conditions and fixed value variations
- Use CSS variables (second example) only when values are truly dynamic, such as:
  - User inputs
  - Calculated positions
  - Animation states
  - Values from external APIs

The yak/style-conditions rule in our linting tools can help identify unnecessary uses of CSS variables, keeping your HTML smaller and more performant.

## Rule details

This rule triggers a warning if an arrow function doesn't return a css literal or a runtime value.

The following patterns are considered errors:

```js
styled.button`
  color: ${() => color};
`;

styled.button`
  color: ${() => {
    if (variant === 'primary') {
      return primary
    } else {
      return secondary
    }
  }};
`;

styled.button`
  color: ${({$variant}) => $variant === 'primary' && colors.primary};
`;
```

The following patterns are not considered errors:

```js
styled.button`
  color: ${({$color}) => $color};
`;

styled.button`
  color: ${color};
`;

styled.button`
  ${() => {
    if (variant === 'primary') {
      return css`
        color: ${primary};
      `;
    } else {
      return css`
        color: ${secondary};
      `;
    }
  }};
`;

styled.button`
  ${() => {
    if (variant === 'primary') {
      return css`
        color: ${({$primary}) => $primary};
      `;
    } else {
      return css`
        color: ${({$secondary}) => $secondary};
      `;
    }
  }};
`;

styled.button`
  ${({$variant}) => $variant === 'primary' && css`
    color: ${({$colors}) => $colors.primary};
  `};
`;
```
