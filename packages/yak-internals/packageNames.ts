/**
 * Names of the React runtime. `@yak/react` is the successor of `next-yak`,
 * so it comes first for code that picks the installed one
 */
export const reactPackageNames = ["@yak/react", "next-yak"] as const;

/**
 * Import sources of all yak runtime packages, for code that must detect any of them.
 * Mirrors YakPackage in yak-swc's yak_imports.rs
 */
export const yakPackageNames = [...reactPackageNames, "@yak/solid"] as const;
