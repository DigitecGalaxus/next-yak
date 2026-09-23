import { createElement as h } from "react";

/**
 * The share card: the section, the page title and the mascot, inside the panel the site's
 * buttons use — a 6px violet edge over a hard offset shadow with no blur.
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

/** The mascot holds the right third, so the title wraps inside 556px. */
const titleSize = (title) => (title.length > 30 ? 68 : title.length > 20 ? 88 : 108);

/**
 * The landing card drops the wordmark row, because its title is the wordmark. It is the
 * one place the card writes "yak" in the title font.
 */
export function Card({ section, title, blurb, mascot, home = false }) {
  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        background: COLORS.beige2,
        padding: "34px 34px 46px 34px",
        fontFamily: "Hanken Grotesk",
      },
    },
    h(
      "div",
      {
        style: {
          display: "flex",
          position: "relative",
          flexGrow: 1,
          background: COLORS.beige1,
          border: `6px solid ${COLORS.violet}`,
          borderRadius: 18,
          // the hard offset the buttons use, scaled to the card
          boxShadow: `12px 12px 0 0 ${COLORS.violet}`,
        },
      },
      // Off the corner and inside the frame, with an even margin top and bottom.
      h("img", {
        src: mascot,
        width: 410,
        height: 424,
        style: { position: "absolute", right: 44, bottom: 66 },
      }),
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            justifyContent: home ? "center" : "space-between",
            padding: "46px 52px",
            width: 660,
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
                fontSize: 26,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: COLORS.red,
                marginBottom: 22,
              },
            },
            section,
          ),
          // Hanken at 900 is the weight SectionHeading uses. Bricolage belongs to the yak
          // wordmark, so only the landing card, whose title is the wordmark, reaches for it.
          h(
            "div",
            home
              ? {
                  style: {
                    fontFamily: "Bricolage Grotesque",
                    fontWeight: 800,
                    fontSize: 184,
                    lineHeight: 1,
                    letterSpacing: -6,
                    color: COLORS.violet,
                  },
                }
              : {
                  style: {
                    fontWeight: 900,
                    fontSize: titleSize(title),
                    lineHeight: 1.02,
                    letterSpacing: titleSize(title) * -0.03,
                    color: COLORS.violet,
                  },
                },
            title,
          ),
          blurb
            ? h(
                "div",
                {
                  style: {
                    display: "flex",
                    fontSize: 27,
                    lineHeight: 1.35,
                    color: COLORS.violetSoft,
                    marginTop: 22,
                  },
                },
                blurb,
              )
            : null,
        ),
        home
          ? null
          : h(
              "div",
              { style: { display: "flex", alignItems: "center" } },
              h(
                "div",
                {
                  style: {
                    fontFamily: "Bricolage Grotesque",
                    fontWeight: 800,
                    fontSize: 40,
                    letterSpacing: -1,
                    color: COLORS.violet,
                  },
                },
                "yak",
              ),
              h("div", { style: { flexGrow: 1 } }),
              h("div", { style: { fontSize: 24, color: COLORS.violetSoft } }, "yak.js.org"),
            ),
      ),
    ),
  );
}
