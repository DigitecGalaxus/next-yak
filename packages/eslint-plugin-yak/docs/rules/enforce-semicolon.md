# Enforces that expression in styled/css literals from next-yak use semicolons (`yak/enforce-semicolon`)

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Enforces semicolons after a mixin, to make distinguishing between mixins and nested selectors easier during build.

## Reason why

Unlike runtime CSS-in-JS libraries that combine strings at execution time, `next-yak` has to understand the code statically. A variable might have different meanings:

- **Selectors** (like `${Button} div { color: blue }`) define styling rules for components
- **Mixins** (like `${skeletonMixin};`) inject pre-defined CSS rules
- **Constants** (like `margin-top: ${marginTop}`)
- **Runtime Variables** (like `x: ${({$x}) => $x}`)

Constants and runtime values are easy to detect as they are always after a colon (:).
However to distinguish between selectors and mixins we need the semicolon (;):

```tsx
// This works correctly - mixin properly terminated with semicolon
styled.div`
  ${skeleton};
  div {
    color: blue;
  }
`

// This causes ambiguity - is it a mixin or part of the selector?
styled.div`
  ${skeleton}
  div {
    color: blue;
  }
`
```

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
