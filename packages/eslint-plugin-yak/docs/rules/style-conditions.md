# Enforces that arrow functions only return runtime values or css literals in styled/css literals from next-yak (`yak/style-conditions`)

💭 This rule requires [type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->

Warns if runtime performance could be improved by using css literals.

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
