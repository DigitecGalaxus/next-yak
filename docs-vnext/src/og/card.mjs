import { createElement as h } from "react";

/**
 * The share card: the section, the page title and the mascot, inside the panel the site's
 * buttons use: a 6px violet edge over a hard offset shadow with no blur.
 *
 * Open Graph carries one image and no colour scheme, so the card owns its background
 * rather than following the reader's theme. It takes the light one, which is the page a
 * first-time reader sees.
 *
 * Colours are hex, not the oklch of the palette, because satori does not read oklch. They
 * are the same values as theme/palette.yak.ts.
 */
export const COLORS = {
  violet: "#22084c",
  violetSoft: "#564b7c",
  beige1: "#fffcf8",
  beige2: "#faf5ef",
  red: "#f2462f",
};

export const SIZE = { width: 1200, height: 630 };

/**
 * A chat app draws the card in a small, almost square box and keeps only the middle of it.
 * Teams keeps about 1.1:1, and a 1:1 crop keeps the central 630px of the 1200px.
 *
 * So the panel is 720px wide and centred, and the words and the mascot live in one column
 * of 616px inside it. A crop takes the beige field and leaves every word and the mascot in
 * place. The first layout ran the full width, and a crop removed the first letter of the
 * title and half the mascot.
 *
 * A panel of 1132px, the full frame, also keeps the crop right. It leaves a wide band of
 * blank paper on each side of the column, and it looks wrong at full width.
 */
const CONTENT = 616;
const PANEL = { width: 720, height: 550 };
/** The border is 6px on each side, so this centres the column in the panel. */
const PAD_X = (PANEL.width - 12 - CONTENT) / 2;

/**
 * The column holds 616px of text. A title of more than 16 characters takes two lines, so
 * it steps down a size.
 */
const titleSize = (title) => (title.length > 30 ? 68 : title.length > 16 ? 76 : 88);

/** The mascot is 620x641, so a width of w needs a height of w * 1.034. */
const yak = (src, width) => h("img", { src, width, height: Math.round(width * 1.034) });

const wordmark = (size) =>
  h(
    "div",
    {
      style: {
        fontFamily: "Bricolage Grotesque",
        fontWeight: 800,
        fontSize: size,
        letterSpacing: -size * 0.025,
        lineHeight: 1,
        color: COLORS.violet,
      },
    },
    "yak",
  );

/**
 * The landing card is the one card whose title is the wordmark, so it takes the title font
 * and it drops the wordmark row. Its title is one short word, which leaves the row beside
 * it empty. The mascot fills that room instead of the bottom corner.
 *
 * The card carries no page description. Every chat app and every search result prints the
 * description beside the card, and at the size the card is drawn the same words are too
 * small to read. The section stays above the row, because the landing column is too
 * narrow to hold it on one line.
 */
export function Card({ section, title, mascot, home = false }) {
  const size = home ? 140 : titleSize(title);

  const titleBlock = h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        // The mascot takes 290 of the 616 on the landing card, so the title column takes
        // 300 and the row keeps a 26px gap.
        ...(home ? { width: 300 } : { flexGrow: 1 }),
      },
    },
    // Hanken at 900 is the weight SectionHeading uses. Bricolage belongs to the yak
    // wordmark, so only the landing card, whose title is the wordmark, reaches for it.
    h(
      "div",
      {
        style: {
          marginTop: 18,
          fontFamily: home ? "Bricolage Grotesque" : "Hanken Grotesk",
          fontWeight: home ? 800 : 900,
          fontSize: size,
          lineHeight: 1.02,
          letterSpacing: size * -0.03,
          color: COLORS.violet,
        },
      },
      title,
    ),
  );

  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: COLORS.beige2,
        fontFamily: "Hanken Grotesk",
      },
    },
    h(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          width: PANEL.width,
          height: PANEL.height,
          background: COLORS.beige1,
          border: `6px solid ${COLORS.violet}`,
          borderRadius: 18,
          // the hard offset the buttons use, scaled to the card
          boxShadow: `12px 12px 0 0 ${COLORS.violet}`,
          padding: `42px ${PAD_X}px 28px ${PAD_X}px`,
          justifyContent: home ? "center" : "space-between",
        },
      },
      h(
        "div",
        { style: { display: "flex", flexDirection: "column" } },
        h(
          "div",
          {
            style: {
              fontWeight: 600,
              fontSize: 24,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: COLORS.red,
            },
          },
          section,
        ),
        home
          ? h(
              "div",
              { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
              titleBlock,
              yak(mascot, 290),
            )
          : titleBlock,
      ),
      home
        ? null
        : h(
            "div",
            { style: { display: "flex", alignItems: "flex-end", justifyContent: "space-between" } },
            h("div", { style: { display: "flex", paddingBottom: 14 } }, wordmark(50)),
            yak(mascot, 205),
          ),
    ),
  );
}
