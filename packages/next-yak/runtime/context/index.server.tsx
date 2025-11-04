//
// This file is the react-server component version of index.tsx
//

// @ts-ignore - in the current @types/react "cache" is not typed
import React, { ReactNode, cache, use } from "react";
import {
  YakTheme,
  YakThemeProvider as YakThemeClientProvider,
} from "./index.js";

// the following import might be changed by
// the user config in withYak to point to their own
// context
import { getYakThemeContext } from "next-yak/context/baseContext";

/** Request based RSC YAK Context */
const getYakContext = cache(() => getYakThemeContext());
export const useTheme = (): YakTheme | undefined => {
  const theme: YakTheme | undefined | Promise<YakTheme> = getYakContext();
  return theme instanceof Promise ? use(theme) : theme;
};
export const YakThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <YakThemeClientProvider theme={getYakContext()}>
      {children}
    </YakThemeClientProvider>
  );
};
