import { css } from "next-yak";
import { light, dark } from "@/tokens";

// Fills BELOW the curve down to the strip's bottom edge (29.86 ≈ 38px / the 1.2727
// scale) with the section's own background, so the area above the wave is genuine
// transparency — the pinned hero shows through the performance section's top edge
// as it scrolls over. <Section> clips its background out of the strip to match.
const FILL_PATH =
  "M0 9.75C87.1333 22.0833 174.233 22.0833 261.3 9.75C352.1 -3.25 442.9 -3.25 533.7 9.75C633.767 22.15 733.8 22.15 833.8 9.75C904.467 -2.58333 975.133 -2.58333 1045.8 9.75C1123.87 21.2167 1201.93 21.2167 1280 9.75V29.86H0Z";

const LINE_PATH =
  "M0 9.5C62.8 15.1667 125.6 15.1667 188.4 9.5C285.2 -1.5 382 -1.5 478.8 9.5C559.533 18.0333 640.3 18.0333 721.1 9.5C799.9 2.36667 878.7 2.36667 957.5 9.5C1039.37 20.7667 1121.23 20.7667 1203.1 9.5C1228.77 3.03333 1254.4 3.03333 1280 9.5";

export default function WaveDivider({
  background,
  flip = false,
}: {
  /** The owning section's background — becomes the below-curve fill. */
  background: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 1280 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      style={{ color: background, transform: flip ? "scaleY(-1)" : undefined }}
      css={css`
        display: block;
        width: 100%;
        height: 38px;

        & > path:first-of-type {
          fill: currentColor;
        }
        & > path:last-of-type {
          stroke: light-dark(${light.beige4}, ${dark.navy5});
        }
      `}
    >
      <path transform="scale(1, 1.2727)" d={FILL_PATH} />
      <path
        transform="scale(1, 1.7)"
        d={LINE_PATH}
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
