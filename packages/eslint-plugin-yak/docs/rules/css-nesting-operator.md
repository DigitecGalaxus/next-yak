# Enforces css selectors in next-yak to correctly use the nesting selector (&) (`yak/css-nesting-operator`)

🔧💡 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix) and manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

Enforces css selectors in next-yak to correctly use the [nesting selector (&)](https://developer.mozilla.org/en-US/docs/Web/CSS/Nesting_selector).

## Reason why

Unlike in `styled-components`, the nesting selector is required to be used in order to correctly scope styles.

We didn't want this magic to be in `next-yak` as writing styles should feel as natural and as close to vanilla CSS as possible.

## Rule details

This rule triggers an error if the nesting selector wasn't used.

The following patterns are considered errors:

```js
styled.div`
  > div {}
`;

styled.div`
  ${({ $condition }) =>
      $condition &&
      css`
        ::before {
          > :focus {
          }
        }
      `
  }
`;

styled.div`
  & > button {
    > span { }
  }
`;

styled.div`
  &:hover,
  :active { }
`;
```

The following patterns are not considered errors:

```js
styled.div`
  & > div {}
`;

styled.div`
  ${({ $condition }) =>
      $condition &&
      css`
        &::before {
          > :focus {
          }
        }
      `
  }
`;

styled.div`
  & > button {
    & > span { }
  }
`;

styled.div`
  &:hover,
  &:active { }
`;
```
