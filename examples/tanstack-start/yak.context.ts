export function getYakThemeContext() {
  return {};
}

declare module "@yak/react" {
  export interface YakTheme extends ReturnType<typeof getYakThemeContext> {}
}
