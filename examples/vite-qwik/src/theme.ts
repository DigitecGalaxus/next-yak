import type { YakTheme } from "@yak/qwik";

/** flips the high-contrast theme in the store and remembers it in a cookie */
export function toggleHighContrast(theme: YakTheme) {
  theme.highContrast = !theme.highContrast;
  setCookie("highContrast", String(theme.highContrast));
}

function setCookie(name: string, value: string, days: number = 365) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
