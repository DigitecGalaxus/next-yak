/**
 * Import sources of all yak runtime packages, for code that must detect any of them.
 * Mirrors YakPackage in yak-swc's yak_imports.rs
 */
export const yakPackageNames = ["next-yak", "@yak/react", "@yak/solid"] as const;
