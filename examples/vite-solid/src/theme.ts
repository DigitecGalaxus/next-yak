import { createSignal } from "solid-js";
import { getYakThemeContext } from "@yak/solid/context/baseContext";

// This only updates the themed styles and doesn't need a page reload compared to React
const [theme, setTheme] = createSignal(getYakThemeContext());

export { theme };

export function toggleHighContrast() {
  const highContrast = !theme()?.highContrast;
  setCookie("highContrast", String(highContrast));
  setTheme({ highContrast });
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
