"use client";
//
// This file is the client component (browser & ssr) version of index.server.tsx
//
import React, { ReactNode, createContext, useContext } from "react";

export interface YakTheme {}

/**
 * The yak theme context
 * @see https://github.com/DigitecGalaxus/next-yak/blob/main/packages/next-yak/runtime/context/README.md
 */
const YakContext = createContext<YakTheme>({});

/**
 * Returns the current yak theme context
 *
 * @see https://github.com/DigitecGalaxus/next-yak/blob/main/packages/next-yak/runtime/context/README.md
 */
export const useTheme = (): YakTheme => useContext(YakContext);

/**
 * Yak theme context provider
 *
 * @see https://github.com/DigitecGalaxus/next-yak/blob/main/packages/next-yak/runtime/context/README.md
 */
export const YakThemeProvider = ({
  children,
  theme = {},
}: {
  children: ReactNode;
  theme?: YakTheme;
}) => <YakContext.Provider value={theme}>{children}</YakContext.Provider>;
