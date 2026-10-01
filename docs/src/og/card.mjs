import { createElement as h } from "react";

// Hex, not oklch: satori cannot read oklch. Keep in sync with theme/palette.yak.ts.
const COLORS = {
  violet: "#22084c",
  beige1: "#fffcf8",
  beige2: "#faf5ef",
  red: "#f2462f",
};

export const SIZE = { width: 1200, height: 630 };

// Chat apps crop the card to about 1:1 (the central 630px), so all content stays in a
// centred 616px column.
const CONTENT = 616;
const PANEL = { width: 720, height: 550 };
// 12 = the 6px border on each side
const PAD_X = (PANEL.width - 12 - CONTENT) / 2;

const titleSize = (title) => (title.length > 30 ? 68 : title.length > 16 ? 76 : 88);

// the mascot image is 620x641
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

export function Card({ section, title, mascot, home = false }) {
  const size = home ? 140 : titleSize(title);

  const titleBlock = h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        ...(home ? { width: 300 } : { flexGrow: 1 }),
      },
    },
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
