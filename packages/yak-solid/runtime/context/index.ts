//
// Theme context for @yak/solid (client & ssr - Solid has no RSC split)
//
import { createContext, renderContextProvider, useContext, type JSX } from "../solid-compat.js";

export interface YakTheme {}

/**
 * The yak theme context
 * @see https://github.com/DigitecGalaxus/next-yak/blob/main/packages/next-yak/runtime/context/README.md
 */
const YakContext = createContext<YakTheme>({});

/**
 * Returns the current yak theme
 *
 * The returned object is a live view: property reads are forwarded to the
 * nearest provider's current `theme` prop, so reads inside memos/effects
 * stay reactive when the theme changes.
 */
export const useTheme = (): YakTheme => useContext(YakContext);

/**
 * Yak theme context provider
 *
 * Solid context values are not reactive by themselves - the provider hands
 * out a stable proxy that forwards every read to the current `props.theme`,
 * so swapping the theme re-runs exactly the computations that used it.
 */
export const YakThemeProvider = (props: {
  children?: JSX.Element;
  theme?: YakTheme;
}): JSX.Element => {
  const reactiveTheme = new Proxy({} as Record<PropertyKey, unknown>, {
    get: (_, key) => (props.theme as Record<PropertyKey, unknown> | undefined)?.[key],
    has: (_, key) => (props.theme ? key in props.theme : false),
    ownKeys: () => (props.theme ? Reflect.ownKeys(props.theme) : []),
    getOwnPropertyDescriptor: (_, key) =>
      props.theme && key in props.theme
        ? { enumerable: true, configurable: true, value: (props.theme as any)[key] }
        : undefined,
  });
  return renderContextProvider(YakContext, reactiveTheme as YakTheme, () => props.children);
};
