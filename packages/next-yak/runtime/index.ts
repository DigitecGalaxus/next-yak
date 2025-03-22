/**
 * This file contains the typings for the public API for next-yak and testing mocks
 *
 * IMPORTANT: In production builds, imports to this file should be replaced by the Babel plugin.
 * If you're seeing this code in a production environment, your build process may not be configured correctly.
 *
 * Purpose:
 * 1. Provide a test-friendly version of the next-yak API
 * 2. Offer type definitions for the public API
 *
 * Usage in tests:
 * - Import from "next-yak" as usual in your test files
 * - These mock implementations will be used instead of the actual runtime
 *
 * Warning for production:
 * - If these exports are used in a production build, styles will not be applied correctly
 * - Ensure your build process is configured to use the next-yak Babel plugin
 *
 * For maintainers:
 * - Keep this API surface in sync with the actual implementation in next-yak/internal
 * - Ensure mock implementations here are suitable for testing purposes
 */

// the following export is not relative as "next-yak/context"
// links to one file for react server components and
// to another file for classic react components
export { useTheme, YakThemeProvider } from "next-yak/context";
export type { YakTheme } from "./context/index.d.ts";

export { atoms } from "./atoms.js";
export { css } from "./mocks/cssLiteral.js";
export { keyframes } from "./mocks/keyframes.js";
export { styled } from "./mocks/styled.js";
