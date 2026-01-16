# Deprecates :global() selectors in favor of native CSS transpilation (`yak/css-global-deprecated`)

<!-- end auto-generated rule header -->

Deprecates `:global()` selectors in favor of native CSS transpilation.

## Reason why

The `:global()` selector was originally introduced to escape CSS module scoping, but with the introduction of native CSS transpilation mode, it is no longer necessary and will be removed in the next major version.

Native CSS transpilation provides a cleaner approach that doesn't require special selectors.

## Migration

To migrate to native CSS transpilation, add the following to your `next.config.js`:

```js
experiments: {
  transpilationMode: 'Css'
}
```

See https://yak.js.org/docs/migration-to-native-css for the full migration guide.

## Rule details

This rule triggers an error when `:global()` selectors are used in styled or css template literals.

The following patterns are considered errors:

```js
styled.div`
  :global(body) {
    margin: 0;
  }
`;

styled.div`
  :global(.some-class) {
    color: red;
  }
`;

css`
  :global(html) {
    font-size: 16px;
  }
`;
```

The following patterns are not considered errors (after migrating to native CSS transpilation):

```js
styled.div`
  body {
    margin: 0;
  }
`;

styled.div`
  .some-class {
    color: red;
  }
`;
```
