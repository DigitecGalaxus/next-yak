export function getYakThemeContext() {
  if (typeof document !== "undefined") {
    const cookies = document.cookie.split(";");
    const highContrastCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("highContrast="),
    );
    const highContrast = highContrastCookie
      ? highContrastCookie.split("=")[1] === "true"
      : false;
    return {
      highContrast,
    };
  }
  return {
    highContrast: false,
  };
}

declare module "next-yak" {
  export interface YakTheme extends ReturnType<typeof getYakThemeContext> {}
}
