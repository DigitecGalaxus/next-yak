import { createElement as h, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { findLogo, type CardData, type FoundLogo } from "./cards.ts";

/** A logo file as a data URL, with ratio = width / height */
export interface LogoAsset {
  src: string;
  ratio: number;
}

/** A logo placed in a title: where it goes and what it draws */
type TitleLogo = FoundLogo & LogoAsset;

/** What a card is built from: elements and arrays of them, flattened by frame() */
type Part = ReactNode | Part[];

// The share card layouts, drawn by satori in scripts/generate-og.ts. The text of each card
// comes from cards.ts
//
// Every light card follows one grid: the title block starts at x=74, the posed yak fills the
// right side, and the footer names the address. Chat apps crop the card to about 1:1 around the
// centre, so the title keeps to the left half and stays readable when the mascot is cut

// Hex, not oklch: satori cannot read oklch. Keep in sync with theme/palette.yak.ts.
const COLORS = {
  violet: "#22084c",
  violetSoft: "#564b7c",
  beige2: "#faf5ef",
  /** The overline above a title, a muted brown that reads as a label and not as an error */
  note: "#7b513b",
  navy1: "#3c3750",
  navy2: "#2b273b",
  navy3: "#201d2c",
  navy5: "#4b4564",
  white: "#efedf8",
  fog: "#a6a1bf",
  /** The code panel of the playground card */
  codeLabel: "#b7ebdf",
  codePunct: "#fff0cf",
};

export const SIZE = { width: 1200, height: 630 };
/** GitHub asks for 1280×640 for the repository preview */
export const GITHUB_SIZE = { width: 1280, height: 640 };

const LEFT = 74;
// the baseline of the footer and of the wordmark
const FOOTER = 544;

const abs = (left: number, top: number, style: CSSProperties = {}): CSSProperties => ({
  position: "absolute",
  left,
  top,
  display: "flex",
  ...style,
});

// Bricolage Grotesque puts the baseline at about 0.8 of the font size below the top of a
// one-line box with `lineHeight: 1`. Every text is placed by its baseline, as in the design
const BASELINE = 0.8;
// The average width of a Bricolage Bold character in em. The measure is rough, so every title
// width keeps a margin
const CHAR_EM = 0.53;
// The distance between two title baselines, in font sizes
const LINE_GAP = 1.03;
// A logo after a title word takes about as much room as 1.5 characters
const LOGO_CHARS = 1.5;
// The smallest title size that still reads at 320px feed width
const MIN_TITLE = 44;
interface TextOptions {
  left: number;
  baseline: number;
  size: number;
  weight?: number;
  color?: string;
  family?: string;
  spacing?: number;
  style?: CSSProperties;
}
const text = (
  content: ReactNode,
  {
    left,
    baseline,
    size,
    weight = 500,
    color,
    family = "Bricolage",
    spacing = 0,
    style = {},
  }: TextOptions,
): ReactElement =>
  h(
    "div",
    {
      style: abs(left, baseline - size * BASELINE, {
        fontFamily: family,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: spacing,
        color,
        whiteSpace: "nowrap",
        ...style,
      }),
    },
    content,
  );

// The largest of `sizes` at which the title fits `width` in at most `maxLines` lines, with
// fewer lines beating a larger size. A title with `|` breaks keeps its lines and only shrinks.
// "next-yak is now @yak/react" at 600px -> 72px, "next-yak is now" / "@yak/react"
interface Fit {
  width: number;
  sizes: number[];
  maxLines: number;
}
function fitTitle(lines: string[], { width, sizes, maxLines }: Fit) {
  const extra = findLogo(lines) ? LOGO_CHARS : 0;
  const charsAt = (size: number) => Math.floor(width / (size * CHAR_EM));
  if (lines.length > 1) {
    const longest = Math.max(...lines.map((line) => line.length)) + extra;
    return { lines, size: Math.min(sizes[0], Math.floor(width / (longest * CHAR_EM))) };
  }
  for (let count = 2; count <= maxLines; count++) {
    for (const size of sizes) {
      const wrapped = wrap(lines[0], charsAt(size) - extra);
      if (wrapped.length <= count) return { lines: wrapped, size };
    }
  }
  // Longer than every listed size allows: keep shrinking until it fits `maxLines`, but fail the
  // build before the title gets too small to read in a feed
  for (let size = sizes[sizes.length - 1] - 4; size >= MIN_TITLE; size -= 4) {
    const wrapped = wrap(lines[0], charsAt(size) - extra);
    if (wrapped.length <= maxLines) return { lines: wrapped, size };
  }
  throw new Error(
    `[og] "${lines[0]}" does not fit a share card in ${maxLines} lines. Shorten it or set cardTitle`,
  );
}

// The logo is { line, index, word, src, ratio } from findLogo() in cards.ts. It splits its line
// around the tool name, "with Vite" -> ["with Vite", <img>], and is 0.75 of the font size
function withLogo(line: string, logo: TitleLogo, size: number) {
  const end = logo.index + logo.word.length;
  const rest = line.slice(end).trim();
  return [
    line.slice(0, end),
    logoImg(logo, size * 0.75, { marginLeft: size * 0.2, marginRight: rest ? size * 0.2 : 0 }),
    rest,
  ].filter(Boolean);
}

const title = (
  lines: string[],
  {
    left = LEFT,
    top,
    size,
    color = COLORS.violet,
    logo,
  }: { left?: number; top: number; size: number; color?: string; logo?: TitleLogo },
) =>
  lines.map((line, i) =>
    text(logo?.line === i ? withLogo(line, logo, size) : line, {
      left,
      baseline: top + size * BASELINE + i * size * LINE_GAP,
      size,
      weight: 700,
      family: "Bricolage",
      spacing: -2,
      color,
      style: { alignItems: "center" },
    }),
  );

// A right arrow as an SVG data URL, because satori draws a font arrow too small and too thin
const arrow = (color: string, stroke = 2.6) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M13 5.5 19.5 12 13 18.5"/></svg>`,
  )}`;

// The page address under the panel, led by a faded arrow: "→ yak.js.org/docs/vite". The arrow
// starts 4px left of the panel text, so the URL itself lines up with the title
const ARROW_OPACITY = 0.5;
const link = (url: string) =>
  text(
    [
      h("img", {
        src: arrow(COLORS.note),
        width: 36,
        height: 36,
        style: { marginRight: 12, opacity: ARROW_OPACITY },
      }),
      url,
    ],
    {
      left: LEFT - 2,
      baseline: FOOTER,
      size: 34,
      color: COLORS.violet,
      style: { alignItems: "center" },
    },
  );

const footer = (
  content: ReactNode,
  {
    left = LEFT,
    color = COLORS.violetSoft,
    size = 34,
  }: { left?: number; color?: string; size?: number } = {},
) => text(content, { left, baseline: FOOTER, size, color, style: { alignItems: "center" } });

// The posed yak with the wordmark centred below it
function brand({
  pose,
  left,
  top,
  size,
  color = COLORS.violet,
}: {
  pose: string;
  left: number;
  top: number;
  size: number;
  color?: string;
}) {
  return [
    h("img", { src: pose, width: size, height: size, style: abs(left, top) }),
    text("yak", {
      left,
      baseline: FOOTER,
      size: 104,
      weight: 800,
      family: "Bricolage",
      spacing: -3,
      color,
      style: { width: size, justifyContent: "center" },
    }),
  ];
}

// `logo` is { src, ratio } with ratio = width / height; the logo fits a `span` square
const logoImg = (logo: LogoAsset, span: number, style: CSSProperties = {}) => {
  const [width, height] = logo.ratio >= 1 ? [span, span / logo.ratio] : [span * logo.ratio, span];
  return h("img", { src: logo.src, width, height, style });
};

// A fan of tilted white tiles, one logo each, for the playground card
function fan(
  logos: LogoAsset[],
  {
    centerX,
    centerY,
    step,
    size,
    tilt = 9,
  }: { centerX: number; centerY: number; step: number; size: number; tilt?: number },
) {
  return logos.map((logo, i) => {
    const offset = i - (logos.length - 1) / 2;
    return h(
      "div",
      {
        style: abs(centerX + offset * step - size / 2, centerY + Math.abs(offset) * 9 - size / 2, {
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ffffff, #eeedf1)",
          borderRadius: 13,
          boxShadow: "0 5px 8px rgba(16, 7, 28, 0.2)",
          transform: `rotate(${offset * tilt}deg)`,
        }),
      },
      logoImg(logo, size * 0.56),
    );
  });
}

const frame = (size: { width: number; height: number }, background: string, children: Part[]) =>
  h(
    "div",
    {
      style: {
        ...size,
        position: "relative",
        display: "flex",
        background,
        fontFamily: "Bricolage",
      },
    },
    ...((children as unknown[]).flat(Infinity) as ReactNode[]),
  );

// The small uppercase line above a title that names the kind of page: "Documentation",
// "Announcement". It sits 28px above the top of the title block
const overline = (content: string, titleTop: number) =>
  text(content, {
    left: LEFT + 4,
    baseline: titleTop - 28,
    size: 26,
    weight: 700,
    spacing: 2.5,
    color: COLORS.note,
    style: { textTransform: "uppercase" },
  });

const tagline = (
  lines: string[],
  { left = LEFT, top, color = COLORS.violetSoft }: { left?: number; top: number; color?: string },
) =>
  lines.map((line, i) => text(line, { left: left + 4, baseline: top + i * 46, size: 38, color }));

// The left column of docs and blog cards: overline, title and subtitle in the bordered panel,
// centred as one block on COLUMN_CENTER, so cards with and without a subtitle sit at one
// height. "Set up yak / with Vite" + "Vanilla CSS syntax in TS / Zero runtime": overline at
// y=124, title from y=152, subtitle baselines at 391 and 437, footer at 544
const COLUMN_CENTER = 300;
interface Column {
  label?: string;
  lines: string[];
  size: number;
  logo?: TitleLogo;
  subtitle?: string[];
}
function textColumn({ label, lines, size, logo, subtitle = [] }: Column): Part[] {
  const titleHeight = lines.length * size * LINE_GAP;
  // 54 = the gap to the first subtitle baseline, 46 = the subtitle line height, 10 = descenders
  const subtitleHeight = subtitle.length ? 54 + (subtitle.length - 1) * 46 + 10 : 0;
  const top = Math.round(COLUMN_CENTER - (titleHeight + subtitleHeight) / 2);
  const panelTop = top - (label ? 80 : 44);
  const panelBottom = top + titleHeight + subtitleHeight + 32;
  const panel = h("div", {
    style: abs(44, panelTop, {
      width: 636,
      height: panelBottom - panelTop,
      background: "#fffcf8",
      border: `6px solid ${COLORS.violet}`,
      borderRadius: 18,
      boxShadow: `12px 12px 0 0 ${COLORS.violet}`,
    }),
  });
  return [
    panel,
    label ? overline(label, top) : [],
    title(lines, { top, size, logo }),
    subtitle.length ? tagline(subtitle, { top: top + titleHeight + 54 }) : [],
  ];
}

// The frameworks on the home and GitHub cards, as files in og/logos
const STACK = ["next", "tanstack", "vite", "rspack"];

// The wordmark as the headline of the home and GitHub cards: "yak" in the brand font
const wordmark = (left: number, baseline: number) =>
  text("yak", { left, baseline, size: 230, weight: 800, spacing: -7, color: COLORS.violet });

// The mascot alone, with the fan of STACK below it
function mascotWithStack({
  left,
  logos,
  pose,
}: {
  left: number;
  logos: Record<string, LogoAsset>;
  pose: string;
}) {
  const size = 350;
  return [
    h("img", { src: pose, width: size, height: size, style: abs(left, 40) }),
    fan(
      STACK.map((name) => logos[name]),
      { centerX: left + size / 2, centerY: 478, step: 82, size: 94 },
    ),
  ];
}

/** One share card as a satori element tree */
export function Card({
  card,
  poses,
  logos,
}: {
  card: CardData;
  /** Data URLs of the pose PNGs */
  poses: Record<string, string>;
  logos: Record<string, LogoAsset>;
}) {
  switch (card.template) {
    // The wordmark "yak" as the headline with the tagline below it, and on the right the excited
    // yak with the framework fan
    case "home":
      return frame(SIZE, COLORS.beige2, [
        wordmark(60, 262),
        tagline(card.tagline ?? [], { top: 384 }),
        mascotWithStack({ left: 760, logos, pose: poses.excited }),
        link(card.url),
      ]);

    // The home card at GitHub's size, with the GitHub icon and the repository name in the footer
    case "github":
      return frame(GITHUB_SIZE, COLORS.beige2, [
        wordmark(64, 262),
        tagline(card.tagline ?? [], { left: 78, top: 384 }),
        mascotWithStack({ left: 830, logos, pose: poses.excited }),
        footer([logoImg(logos.github, 38, { marginRight: 12 }), card.url], {
          left: 82,
          color: COLORS.violet,
        }),
      ]);

    // "API / reference" with the explaining yak on the right. A technology name in the title
    // gets its logo: "Set up yak / with Vite <vite logo>"
    case "docs":
      return frame(SIZE, COLORS.beige2, [
        textColumn(column(card, logos, { width: 580, sizes: [90, 80, 72, 64], maxLines: 2 })),
        brand({ pose: poses.guide, left: 716, top: 85, size: 390 }),
        link(card.url),
      ]);

    // Dark card: the title, a code panel showing `styled.button` → `.button`, and a fan of
    // the React, Solid and Qwik logos
    case "playground": {
      const panel = { left: LEFT, top: 194, width: 1052, height: 250 };
      const code = (content: string, left: number, baseline: number, color = COLORS.beige2) =>
        text(content, { left, baseline, size: 28, family: "JetBrains Mono", weight: 400, color });
      return frame(SIZE, COLORS.navy2, [
        title(card.lines, { top: 136 - 82 * BASELINE, size: 82, color: COLORS.white }),
        text("yak", {
          left: 858,
          baseline: 128,
          size: 76,
          weight: 800,
          spacing: -3,
          color: COLORS.white,
        }),
        h("img", { src: poses.guide, width: 124, height: 124, style: abs(1000, 38) }),
        h("div", {
          style: abs(panel.left, panel.top, {
            width: panel.width,
            height: panel.height,
            background: COLORS.navy3,
            border: `2px solid ${COLORS.navy5}`,
            borderRadius: 18,
            flexDirection: "column",
          }),
        }),
        // the panel header and the line between input and output
        h("div", {
          style: abs(panel.left + 2, panel.top + 2, {
            width: panel.width - 4,
            height: 58,
            background: COLORS.navy1,
            borderRadius: "16px 16px 0 0",
          }),
        }),
        h("div", {
          style: abs(600, panel.top + 60, {
            width: 2,
            height: panel.height - 62,
            background: COLORS.navy5,
          }),
        }),
        text("CSS-in-JS", { left: 103, baseline: 234, size: 29, color: COLORS.codeLabel }),
        text("CSS", { left: 654, baseline: 234, size: 29, color: COLORS.codeLabel }),
        code("styled.button`", 103, 309, COLORS.codePunct),
        code("color: coral;", 122, 360),
        code("`", 103, 411, COLORS.codePunct),
        code(".button {", 654, 309, COLORS.codePunct),
        code("color: coral;", 674, 360),
        code("}", 654, 411, COLORS.codePunct),
        h(
          "div",
          {
            style: abs(574, 315, {
              width: 52,
              height: 46,
              background: COLORS.navy3,
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.codeLabel,
              fontSize: 40,
            }),
          },
          "→",
        ),
        fan([logos.react, logos.solid, logos.qwik], {
          centerX: 1000,
          centerY: 524,
          step: 56,
          size: 70,
        }),
        footer(card.url, { color: COLORS.fog }),
      ]);
    }

    // The post title with its category above and the leaping yak on the right
    case "blog":
      return frame(SIZE, COLORS.beige2, [
        textColumn(column(card, logos, { width: 600, sizes: [84, 72, 64, 56, 48], maxLines: 3 })),
        brand({ pose: poses.leap, left: 716, top: 55, size: 420 }),
        link(card.url),
      ]);

    default:
      throw new Error(`[og] unknown card template "${card.template}"`);
  }
}

// The props of textColumn() for a docs or blog card: the title fitted to its box and the logo
// found on the fitted lines
function column(card: CardData, logos: Record<string, LogoAsset>, fit: Fit): Column {
  const { lines, size } = fitTitle(card.lines, fit);
  const found = findLogo(lines);
  const logo = found && { ...found, ...logos[found.file] };
  return { label: card.label, lines, size, logo, subtitle: card.subtitle };
}

// Breaks a title into lines of at most `max` characters, at spaces
function wrap(title: string, max: number) {
  const lines: string[] = [];
  for (const word of title.split(" ")) {
    const last = lines.at(-1);
    if (last !== undefined && `${last} ${word}`.length <= max)
      lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}
