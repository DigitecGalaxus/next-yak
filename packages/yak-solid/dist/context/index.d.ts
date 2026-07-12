import { JSX } from "@solidjs/web";

//#region runtime/context/index.d.ts
interface YakTheme {}
/**
 * Returns the current yak theme
 *
 * The returned object is a live view: property reads are forwarded to the
 * nearest provider's current `theme` prop, so reads inside memos/effects
 * stay reactive when the theme changes.
 */
declare const useTheme: () => YakTheme;
/**
 * Yak theme context provider
 *
 * Solid context values are not reactive by themselves - the provider hands
 * out a stable proxy that forwards every read to the current `props.theme`,
 * so swapping the theme re-runs exactly the computations that used it.
 */
declare const YakThemeProvider: (props: {
  children?: JSX.Element;
  theme?: YakTheme;
}) => JSX.Element;
//#endregion
export { YakTheme, YakThemeProvider, useTheme };
//# sourceMappingURL=index.d.ts.map