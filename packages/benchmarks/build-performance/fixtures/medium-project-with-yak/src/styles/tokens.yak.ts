export const base = {
  light: {
    background: "#ffffff",
    foreground: "#171717",
  },
  dark: {
    background: "#0a0a0a",
    foreground: "#ededed",
  },
};

export const semantic = {
  light: {
    bg: base.light.background,
    fg: base.light.foreground,
    mutedFg: "rgba(0, 0, 0, 0.6)",
    border: "rgba(0, 0, 0, 0.08)",
    surface: "#f7f7f8",
    surfaceHover: "#f0f0f1",
    primary: "#0a7cff",
    primaryFg: "#ffffff",
    secondary: "#eaeaea",
    secondaryFg: "#111111",
    success: "#17c964",
    warning: "#f5a524",
    danger: "#f31260",
  },
  dark: {
    bg: base.dark.background,
    fg: base.dark.foreground,
    mutedFg: "rgba(255, 255, 255, 0.8)",
    border: "rgba(255, 255, 255, 0.12)",
    surface: "#111213",
    surfaceHover: "#1a1b1c",
    primary: "#4099ff",
    primaryFg: "#081018",
    secondary: "#1f1f20",
    secondaryFg: "#e7e7e7",
    success: "#2ecc71",
    warning: "#f5a524",
    danger: "#ff477e",
  },
};

export const radius = {
  sm: "6px",
  md: "10px",
  lg: "12px",
  full: "9999px",
};
