/**
 * Import sources of all yak runtime packages, for code that must detect any of them.
 * Mirrors YakPackage in yak-swc's yak_imports.rs
 */
export const yakPackageNames = ["@yak/react", "@yak/solid", "@yak/qwik"] as const;
