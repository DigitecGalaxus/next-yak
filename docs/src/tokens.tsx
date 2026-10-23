import { css } from "@yak/react";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

// The title font only sets the "yak" wordmark, so the file holds just the glyphs a, k and y
// (1 kB instead of 22 kB). Other text in it falls back to the next font in the stack.
// Made with: pyftsubset <Bricolage Grotesque 800 latin woff2> --text="yak" --layout-features='*' --flavor=woff2
export const bricolageSans = localFont({
  src: "./fonts/bricolage-yak.woff2",
  weight: "800",
  style: "normal",
  variable: "--font-title",
});

export const hankenSans = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

/**
 * Code is set in two faces of JetBrains Mono, and this is the small one: ASCII plus the few
 * other characters the site sets in mono (the non-breaking space Monaco renders for every
 * space, "·", typographic quotes, "…" and the arrows). It is 12 kB instead of 41 kB and
 * preloaded, because the hero code block is the largest element above the fold and so
 * decides LCP. Its unicode-range tells the browser what the face holds, so an "é" in a
 * comment or in playground code takes the full face `jetbrainsMono`, which downloads only then.
 *
 * Made with: pyftsubset <JetBrains Mono latin woff2> --unicodes="<the unicode-range below>" --layout-features='' --flavor=woff2
 * No layout features: the ligatures (`calt`) would make the file 30 kB
 */
export const jetbrainsMonoCode = localFont({
  src: "./fonts/jetbrains-mono-code.woff2",
  weight: "100 800",
  style: "normal",
  variable: "--font-mono-code",
  declarations: [
    {
      prop: "unicode-range",
      value: "U+0020-007E,U+00A0,U+00B7,U+2013-2014,U+2018-2019,U+201C-201D,U+2026,U+2190-2193",
    },
  ],
  /** The fallbacks live on the full face, which comes next in `fonts.mono` */
  adjustFontFallback: false,
});

/**
 * The full face for characters the code face lacks. Its fallbacks are monospace fonts, not
 * Next's default size-adjusted Arial, so code keeps its columns while a font loads
 */
export const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  preload: false,
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});

export const fonts = {
  title: `var(--font-title)`,
  body: `var(--font-body)`,
  mono: `var(--font-mono-code), var(--font-mono)`,
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
