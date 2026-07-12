/**
 * This file contains the typings for the public API for @yak/solid and testing mocks
 *
 * IMPORTANT: In production builds, imports to this file should be replaced by the SWC plugin.
 * If you're seeing this code in a production environment, your build process may not be configured correctly.
 *
 * Purpose:
 * 1. Provide a test-friendly version of the @yak/solid API
 * 2. Offer type definitions for the public API
 *
 * Usage in tests:
 * - Import from "@yak/solid" as usual in your test files
 * - These mock implementations will be used instead of the actual runtime
 *
 * Warning for production:
 * - If these exports are used in a production build, styles will not be applied correctly
 * - Ensure your build process is configured to use the yak-swc SWC plugin
 *   (e.g. via `viteYakSolid` from "@yak/solid/vite")
 *
 * For maintainers:
 * - Keep this API surface in sync with the actual implementation in @yak/solid/internal
 * - Ensure mock implementations here are suitable for testing purposes
 */

import "./cssProp.js";

// the context is a package-level export so the vite plugin can alias
// "@yak/solid/context/baseContext" to the user's theme context file
export { useTheme, YakThemeProvider } from "@yak/solid/context";
export type { YakTheme } from "./context/index.ts";

export type { GenericYakComponentOf, YakComponent } from "./publicStyledApi.ts";

export { atoms } from "./atoms.js";
export { css } from "./mocks/cssLiteral.js";
export { keyframes } from "./mocks/keyframes.js";
export { styled } from "./mocks/styled.js";
export { globalStyle } from "./mocks/globalStyle.js";
export type { GlobalStyleInterpolation } from "./mocks/globalStyle.js";
