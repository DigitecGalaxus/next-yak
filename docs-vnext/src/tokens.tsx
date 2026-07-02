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

// The palette is defined in ./theme/palette.yak.ts as plain color lists. Re-exported here so
// `@/tokens` stays the single import surface. Components compose colors themselves, e.g.
// `light-dark(${light.violet}, ${dark.white})` for theme-adaptive, `${ink.card}` for the
// always-dark editor chrome.
export { light, dark, ink, status, headerBg, scrim } from "./theme/palette.yak";

// Soft elevation under a dark floating surface. `card` is the resting code/editor card;
// `popover` is a panel floating above it (dropdowns, the twoslash hover, the hero
// terminal). Two values replace the four that had drifted apart.
export const shadow = {
  card: "0 18px 44px -14px rgba(8, 4, 20, 0.55)",
  popover: "0 16px 40px -10px rgba(15, 3, 38, 0.5)",
  indicator: "0 1px 3px light-dark(rgba(31, 10, 77, 0.16), rgba(0, 0, 0, 0.4))", // coverage tab pill
} as const;

// The code-highlight (shiki) palette. Raw hex — NOT CSS vars — because it's consumed at
// build time by the shiki theme in lib/yak-theme.ts (imported by source.config.ts, which
// runs outside Next and can't resolve `var(--…)` or `next/font`). Defined there so that
// leaf file stays dependency-free; re-exported here so `@/tokens` is the single palette
// import surface for runtime code (e.g. the docs code-block icon color).
export { syntax } from "@/lib/yak-theme";

export const typography = {
  display: "22px",
};

// Only the sizes/weights/radii shared by 2+ components live here; one-offs stay inline.
export const fontSize = {
  h3: "17px",
  small: "14px",
  eyebrow: "13px",
} as const;

export const fontWeight = {
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;

export const radii = {
  pill: "999px",
  card: "14px",
} as const;

export const maxContentWidth = "1450px";

// Height of the sticky header. The docs sidebar and TOC rail pin just beneath it, so
// their sticky `top` / available-height offsets derive from this one value rather than
// repeating the magic number (the TOC sits a further 24px down for breathing room).
export const headerHeight = "72px";

// Two kinds of breakpoint, kept apart on purpose.
//
// `screen` — real VIEWPORT breakpoints, used with @media. They decide whether a
// structural column exists at all (the docs sidebar, the TOC rail, the desktop nav
// vs the mobile drawer). A container query can't make that call: the sidebar is
// part of what defines the content's container width, so asking the container
// whether the sidebar should exist would be circular. These are global "how wide is
// the window" facts. `nav` is also read as an @container query by the full-bleed
// header (whose container width tracks the viewport), so the header and the docs
// layout collapse at exactly the same width — same token, two mechanisms.
export const screen = {
  nav: "860px", // header nav → drawer; docs sidebar hides
  toc: "1100px", // docs TOC rail hides
} as const;

// `container` — CONTAINER breakpoints, used with @container. They describe how a
// block arranges within its OWN width, so the same component lays out correctly
// whether it sits full-bleed on the landing page or inside the much narrower docs
// prose column. Grouped by the container they belong to, because a threshold is only
// meaningful relative to that container — there is deliberately no shared t-shirt
// scale across them (the editor's 460 and a section's 460 mean different things, and
// the prose thresholds are smaller than the viewport values they replaced because a
// 768px-capped column is narrower than the window it lives in).
export const container = {
  editor: {
    switch: "460px", // framework pills ↔ compact dropdown
  },
  section: {
    twoCol: "460px", // feature grid 1 → 2 columns
    figureRow: "560px", // benchmark caption stacks → row
    splitRow: "640px", // rename block: mascot beside the copy
    statGrid: "700px", // stat cards 2 → 4 col; coverage terminal beside "works with"
    threeCol: "720px", // feature grid 2 → 3 columns
    flow: "800px", // how-it-works steps reflow into the 3-col diagram
  },
  hero: {
    split: "950px", // hero copy beside the editor
  },
  prose: {
    sideBySide: "620px", // <SideBySide> 2 → 1 col (each code column drops under ~300px)
    table: "560px", // comparison table tightens its horizontal padding
  },
} as const;

// Colors now live inline in each component via `light-dark()`, so all this needs to do is set
// `color-scheme` — that's what `light-dark()` reads to pick a side. The theme toggle sets
// `data-theme` on <html>; with no attribute, `light dark` follows the OS preference.
export const initVars = css`
  color-scheme: light dark;

  &[data-theme="dark"] {
    color-scheme: dark;
  }

  &[data-theme="light"] {
    color-scheme: light;
  }
`;
