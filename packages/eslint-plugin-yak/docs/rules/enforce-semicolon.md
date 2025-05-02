# Enforces that expression in styled/css literals from next-yak use semicolons (`yak/enforce-semicolon`)

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Enforces semicolons after a mixin, to make distinguishing between mixins and nested selectors easier.

## Rule details

This rule triggers an error if a mixin is not followed by a semicolon.

The following patterns are considered errors:

```js
styled.div`
  ${skeletonStyle}
`;

styled.button`
     ${myMixin}
`;

styled.button`
  ${otherMixin}
  margin-bottom: 10px;
`;

styled.button`
  ${$visuallyUnmounted &&
    css`
      ${screenRangeQueries.desktopWidescreen} {
        transform: translateY(0);
      }
    `
  }
  ${foo}
`;
```

The following patterns are not considered errors:

```js
styled.div`
  ${skeletonStyle};
`;

styled.button`
     ${myMixin};
`;

styled.button`
  ${otherMixin};
  margin-bottom: 10px;
`;

styled.button`
  ${$visuallyUnmounted &&
    css`
      ${screenRangeQueries.desktopWidescreen} {
        transform: translateY(0);
      }
    `
  }
  ${foo};
`;
```
