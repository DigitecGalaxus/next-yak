/**
 * Barrel with namespace re-export.
 *
 * `export * as mixins` is a namespace object -- NOT a React component type.
 * This makes isReactRefreshBoundary return false for this module.
 * HMR updates from Divider.tsx propagate through without being accepted.
 */
export { Divider } from "./Divider.tsx";
export * as mixins from "./mixins.ts";
