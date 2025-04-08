/**
 * IMPORTANT: This file contains the internal implementation of next-yak's core APIs.
 *
 * Purpose:
 * - Provides the actual runtime implementations for styled, css, keyframes, etc.
 * - Referenced only by the compiled code "next-yak/internal"
 *
 * Usage:
 * - DO NOT import from this file directly in your application code.
 * - Always use `import { ... } from "next-yak"` in your source files.
 * - The Babel plugin will automatically transform those imports to use this internal module.
 *
 * Why this exists:
 * 1. Allows for cleaner separation between the public API and internal implementation
 * 2. Enables better typing for both pre-compilation (user code) and post-compilation scenarios
 * 3. Easier testing and snapshot comparisons without hashes (in index.ts)
 * 4. Makes next-yak work out-of-the-box with testing frameworks like Jest and Vitest
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

// the following export is not relative as "next-yak/context"
// links to one file for react server components and
// to another file for classic react components
export { useTheme, YakThemeProvider } from "next-yak/context";

// runtime internals (helpers which get injected by the compiler)
export { unitPostFix as __yak_unitPostFix } from "./internals/unitPostFix.js";

// export shorthand for DOM styled components (e.g. for styled.div)
export * from "./styledDom.js";
