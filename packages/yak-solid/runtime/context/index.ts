import { createComponent, createContext, createMemo, useContext } from "solid-js";
import type { Accessor } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface YakTheme {}

/**
 * The yak theme context
 *
 * @see https://github.com/DigitecGalaxus/next-yak/blob/main/packages/next-yak/runtime/context/README.md
 */
export const YakThemeContext = /* @__PURE__ */ createContext<Accessor<YakTheme>>(() => ({}));

/**
 * Returns an accessor to the current yak theme
 */
export const useTheme = (): Accessor<YakTheme> => useContext(YakThemeContext);

/**
 * Yak theme context provider
 *
 * ```tsx
 * <YakThemeProvider theme={{ highContrast: highContrast() }}>
 * ```
 */
export const YakThemeProvider = (props: {
  children?: JSX.Element;
  theme?: YakTheme;
}): JSX.Element => {
  const theme = createMemo<YakTheme>(() => props.theme ?? {});
  return createComponent(YakThemeContext, {
    value: theme,
    get children() {
      return props.children;
    },
  });
};
