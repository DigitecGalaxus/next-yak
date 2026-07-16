/**
 * Internal, render-time markers written onto props (or the merged attrs
 * function) and read back to skip repeated work across a `styled(...)` chain.
 *
 * These are NOT a compiler contract — nothing in yak-swc emits them — and they
 * never appear on the public API. The leading `$` is load-bearing:
 * `removeNonDomProperties` strips `$`-prefixed props, so a marker can never
 * reach the DOM. The `__` on the two prop markers guards against a user's own
 * `$`-prop colliding with one. The values are kept short so the app bundler
 * ships fewer bytes; the descriptive export names are how they read in source.
 *
 * Imported as a namespace (`import * as INTERNAL`) so each use site reads as
 * `INTERNAL.ATTRS_MERGED`; esbuild inlines the `const` values, leaving nothing
 * of the namespace in the shipped bundle.
 */

/**
 * Set on props once the attrs functions have been folded in, so a nested yak
 * wrapper further out the chain does not merge the same attrs twice.
 */
export const ATTRS_MERGED = "$__a" as const;

/**
 * Set on props once the runtime style processor has run, so an outer yak
 * component that receives already-processed props skips the collector entirely.
 */
export const RUNTIME_STYLES_DONE = "$__r" as const;

/**
 * Carries the constant `.attrs({...})` object on the merged attrs function,
 * marking it theme-independent so the fast render path can apply it without
 * executing anything. Lives on the function, never on props.
 */
export const STATIC_ATTRS = "$sa" as const;
