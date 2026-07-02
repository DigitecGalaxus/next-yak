import { alpha, brand, cyanOk, paper, redOk } from "./oklch.ts";

const inkTint = "#fffdf8";
const inkBlack = "#141019";
const inkDeep = brand(0.182, 0.019);

export const light = {
  violet: brand(0.232),
  violetSoft: brand(0.446),
  beige1: paper(0.994),
  beige2: paper(0.972),
  beige3: paper(0.94),
  beige4: paper(0.915),
  beige5: paper(0.872),
  beige6: paper(0.779),
  red: redOk(0.641, 0.212),
};

export const dark = {
  white: brand(0.951),
  fog: brand(0.724),
  navy1: brand(0.243, 0.038),
  navy2: brand(0.292, 0.037),
  navy3: brand(0.182, 0.019),
  navy4: brand(0.284, 0.049),
  navy5: brand(0.326, 0.044),
  navy6: brand(0.467, 0.074),
  red: redOk(0.689, 0.201),
  redDeep: redOk(0.562, 0.201),
  black: "black",
  violetGlow: brand(0.624, 0.071),
};

// The always-dark editor/code surface stays the same in both themes, so these aren't light/dark pairs.
export const ink = {
  fg: inkTint,
  fgMuted: alpha(inkTint, 0.7),
  fgSubtle: brand(0.797, 0.063),
  border: alpha(inkTint, 0.13),
  divider: alpha(inkTint, 0.18),
  hover: alpha(inkTint, 0.1),
  fill: alpha(inkTint, 0.08),
  underline: alpha(inkTint, 0.4),
  base: brand(0.232),
  card: brand(0.278),
  terminal: brand(0.308),
  track: brand(0.337),
  popup: brand(0.206),
  popover: brand(0.295, 0.148),
  switcherTrack: brand(0.223, 0.08),
  switcherBorder: brand(0.349, 0.04),
  prompt: brand(0.624, 0.099),
  cyan: cyanOk(0.854, 0.144),
  cyanBorder: alpha(cyanOk(0.916, 0.089), 0.25),
  copyActive: cyanOk(0.589, 0.099),
  copyEdge: inkBlack,
  dotRed: redOk(0.641, 0.212),
  dotYellow: "oklch(0.872 0.153 88)",
  dotGreen: "oklch(0.729 0.134 178)",
};

export const status = {
  info: "oklch(0.623 0.188 260)",
  warn: "oklch(0.769 0.165 70)",
  success: "oklch(0.723 0.192 150)",
  error: "oklch(0.637 0.208 25)",
};

export const headerBg = `light-dark(${alpha(paper(0.972), 0.82)}, ${alpha(inkDeep, 0.82)})`;
export const scrim = alpha(inkDeep, 0.45);
