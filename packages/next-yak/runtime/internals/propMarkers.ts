/** Internal, render-time markers written onto props */

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
