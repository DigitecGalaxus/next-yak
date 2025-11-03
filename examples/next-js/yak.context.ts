export function getYakThemeContext() {
    return {
        highContrast: false
    }
}

declare module "next-yak" {
    export interface YakTheme extends ReturnType<typeof getYakThemeContext> { }
}