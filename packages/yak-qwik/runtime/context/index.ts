import { createContextId, useContext } from "@qwik.dev/core";
import { _resolveContextWithoutSequentialScope } from "@qwik.dev/core/internal";
import { getYakThemeContext } from "./baseContext.js";

export interface YakTheme {}

/**
 * The yak theme context. Provide it once in a component$ near the root:
 * ```tsx
 * export default component$(() => {
 *   const theme = useStore({ mode: "light" });
 *   useContextProvider(YakThemeContext, theme);
 *   return <Slot />;
 * });
 * ```
 * (context ids may contain only letters, digits, `_`, `.` and `-`)
 *
 * @see https://github.com/DigitecGalaxus/next-yak/blob/main/packages/next-yak/runtime/context/README.md
 */
export const YakThemeContext = /* @__PURE__ */ createContextId<YakTheme>("yak.theme");

const fallbackTheme = (): YakTheme => (getYakThemeContext() ?? {}) as YakTheme;

/**
 * The current yak theme, for component$ code. Falls back to the theme of
 * yak.context.ts when nothing provides one.
 */
export const useTheme = (): YakTheme => useContext(YakThemeContext, fallbackTheme());

/**
 * The theme for a styled component, which is a plain function inlined into
 * its parent and so cannot call useContext (Qwik error Q10). Qwik's own router
 * reads context the same way; the helper is marked internal by Qwik, so this
 * is the one place to fix when it moves.
 */
export const readTheme = (): YakTheme =>
  _resolveContextWithoutSequentialScope(YakThemeContext) ?? fallbackTheme();
