import { css } from "next-yak";
import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";

export const bricolageSans = Bricolage_Grotesque({
  weight: "800",
  style: "normal",
  variable: "--font-title",
  subsets: ["latin"],
});

export const hankenSans = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

export const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const fonts = {
  title: `var(--font-title)`,
  body: `var(--font-body)`,
  mono: `var(--font-mono)`,
} as const;

export { light, dark, ink, status, headerBg, scrim } from "./theme/palette.yak";
export { syntax } from "@/lib/yak-theme";

export const shadow = {
  card: "0 18px 44px -14px rgba(8, 4, 20, 0.55)",
  popover: "0 16px 40px -10px rgba(15, 3, 38, 0.5)",
  indicator: "0 1px 3px light-dark(rgba(31, 10, 77, 0.16), rgba(0, 0, 0, 0.4))",
} as const;

export const fontSize = {
  display: "22px",
  h3: "17px",
  small: "14px",
  eyebrow: "13px",
} as const;

export const fontWeight = {
  semibold: 600,
  bold: 700,
  black: 900,
} as const;

export const radii = {
  pill: "999px",
  card: "14px",
} as const;

export const maxContentWidth = "1450px";

export const headerHeight = "72px";

// Viewport breakpoints (@media) decide whether a layout column exists at all. `nav` is also
// used as an @container query by the full-bleed header, so both collapse at the same width.
export const screen = {
  nav: "860px", // header nav → drawer; docs sidebar hides
  toc: "1100px", // docs TOC rail hides
} as const;

export const container = {
  editor: {
    switch: "460px", // framework pills ↔ compact dropdown
    switchPair: "560px", // same, for two switchers in one row (playground files + framework)
  },
  section: {
    twoCol: "740px", // feature concept cards 1 → 2 columns
    annotateOne: "800px", // feature callout cards line up on one side of the editor, snapped to code lines
    annotate: "980px", // feature callout cards flank the editor on both sides
    flow: "960px", // how-it-works pipeline: stacked → yours · plugin · outputs row
  },
  hero: {
    split: "950px", // hero copy beside the editor
  },
  card: {
    row: "600px", // feature concept card: copy stacked above code → copy beside code
  },
  prose: {
    sideBySide: "620px", // <SideBySide> 2 → 1 col
    table: "560px", // comparison table tightens its horizontal padding
  },
} as const;

// The theme toggle sets `data-theme` on <html>. Without it, `light-dark()` follows the OS.
export const initVars = css`
  color-scheme: light dark;

  &[data-theme="dark"] {
    color-scheme: dark;
  }

  &[data-theme="light"] {
    color-scheme: light;
  }
`;
