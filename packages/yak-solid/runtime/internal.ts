/**
 * IMPORTANT: This file contains the internal implementation of @yak/solid's core APIs.
 *
 * Purpose:
 * - Provides the actual runtime implementations for styled, css, keyframes, etc.
 * - Referenced only by the compiled code "@yak/solid/internal"
 *
 * Usage:
 * - DO NOT import from this file directly in your application code.
 * - Always use `import { ... } from "@yak/solid"` in your source files.
 * - The SWC plugin will automatically transform those imports to use this internal module.
 *
 * Why this exists:
 * 1. Allows for cleaner separation between the public API and internal implementation
 * 2. Enables better typing for both pre-compilation (user code) and post-compilation scenarios
 * 3. Easier testing and snapshot comparisons without hashes (in index.ts)
 * 4. Makes @yak/solid work out-of-the-box with testing frameworks like Jest and Vitest
 *
 * Note for maintainers:
 * - Ensure that types from this file are not published to avoid exposing internal APIs.
 *
 * @internal This module is not intended for direct usage and may change without notice.
 */

export { css } from "./cssLiteral.js";
export { styled } from "./styled.js";
export { atoms } from "./atoms.js";
export { keyframes } from "./keyframes.js";
export { globalStyle } from "./globalStyle.js";

// the context is a package-level export so the vite plugin can alias
// "@yak/solid/context/baseContext" to the user's theme context file
export { useTheme, YakThemeProvider } from "@yak/solid/context";

// runtime internals (helpers which get injected by the compiler)
export { unitPostFix as __yak_unitPostFix } from "./internals/unitPostFix.js";
export { mergeCssProp as __yak_mergeCssProp } from "./internals/mergeCssProp.js";

// export shorthand for DOM styled components (e.g. for styled.div)
export * from "./styledDom.js";
