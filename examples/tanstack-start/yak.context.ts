export function getYakThemeContext() {
  return {};
}

declare module "next-yak" {
  export interface YakTheme extends ReturnType<typeof getYakThemeContext> {}
}
