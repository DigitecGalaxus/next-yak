import { alpha, brand, paper, redOk } from "./oklch.ts";

const inkTint = "#fffdf8";
const inkBlack = "#141019";
const inkDeep = brand(0.182, 0.019);
const successGreen = "oklch(0.78 0.16 150)";

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
  redDeep: redOk(0.58, 0.212),
};

export const dark = {
  white: brand(0.951),
  fog: brand(0.724),
  navy1: brand(0.352, 0.044),
  navy2: brand(0.288, 0.036),
  navy3: brand(0.242, 0.028),
  navy4: brand(0.252, 0.03),
  navy5: brand(0.408, 0.052),
  navy6: brand(0.478, 0.072),
  red: redOk(0.689, 0.201),
  redDeep: redOk(0.562, 0.201),
  edge: brand(0.148, 0.032),
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
  base: brand(0.195, 0.088),
  card: brand(0.241, 0.083),
  terminal: brand(0.271, 0.088),
  track: brand(0.3, 0.085),
  popup: brand(0.169, 0.085),
  popover: brand(0.26, 0.115),
  switcherTrack: brand(0.186, 0.072),
  switcherBorder: brand(0.312, 0.05),
  switcherEdge: brand(0.095, 0.025),
  prompt: brand(0.624, 0.099),
  success: successGreen,
  successDeep: "oklch(0.52 0.15 150)",
  copyEdge: inkBlack,
  dotRed: redOk(0.641, 0.212),
  dotYellow: "oklch(0.872 0.153 88)",
  dotGreen: successGreen,
};

export const status = {
  info: "oklch(0.623 0.188 260)",
  warn: "oklch(0.769 0.165 70)",
  success: "oklch(0.723 0.192 150)",
  error: "oklch(0.637 0.208 25)",
};

export const headerBg = `light-dark(${alpha(light.beige2, 0.82)}, ${alpha(dark.navy2, 0.82)})`;
export const scrim = alpha(inkDeep, 0.45);
