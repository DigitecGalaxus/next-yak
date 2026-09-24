import { css, styled } from "next-yak";
import Image from "next/image";
import { Fragment, type CSSProperties } from "react";
import { fonts, fontSize, fontWeight, ink, light, dark } from "@/tokens";
import { asset } from "@/lib/site";

// "SSR throughput under load", whole shop page workload, styled API lane, from
// jantimon.github.io/css-in-js-bench. `percent` is the share of yak's 205 req/s.
const YAK_BENCH = { version: "9.10.0", value: "205" };

const BENCH_ROWS = [
  { label: "StyleX", version: "0.19.0", value: "167", percent: 81.5 },
  { label: "tailwind-merge", version: "3.7.0", value: "105", percent: 51.2 },
  { label: "styled-components", version: "6.5.3", value: "80", percent: 39 },
  { label: "Panda", version: "2.0.0-beta.17", value: "76", percent: 37.1 },
  { label: "Emotion", version: "11.14.1", value: "58", percent: 28.3 },
];

// Track width at which the shortest bar (Emotion, 28.3%) fits its 50px number. Above it
// all numbers move inside their bars. Recompute when the data changes.
const TRACK_HOLDS_NUMBERS = "178px";

const VALUE_COLUMN = "34px";

export default function BenchmarkChart() {
  return (
    <figure
      css={css`
        position: relative;
        background: light-dark(${light.beige1}, ${dark.navy1});
        border: 1px solid light-dark(${light.beige5}, ${dark.navy5});
        border-radius: 16px;
        padding: clamp(16px, 3cqi, 28px) clamp(16px, 3.5cqi, 36px) clamp(20px, 3.5cqi, 32px);
      `}
    >
      <figcaption
        css={css`
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: baseline;
          gap: 4px 16px;
          /* headroom for the rider on the yak bar */
          margin-bottom: clamp(46px, 7cqi, 60px);
        `}
      >
        <span
          css={css`
            font-size: ${fontSize.h3};
            font-weight: ${fontWeight.bold};
            white-space: nowrap;
            color: light-dark(${light.violet}, ${dark.white});
          `}
        >
          SSR performance
        </span>
        <span
          css={css`
            font-family: ${fonts.mono};
            font-size: 13px;
            text-wrap: balance;
            color: light-dark(${light.violetSoft}, ${dark.fog});
          `}
        >
          requests / second · higher is better ↑
        </span>
      </figcaption>
      <div
        css={css`
          display: grid;
          /* fit-content lets "styled-components" wrap at its hyphen */
          grid-template-columns: fit-content(140px) minmax(0, 1fr);
          column-gap: clamp(10px, 2cqi, 20px);
          row-gap: clamp(12px, 2.5cqi, 22px);
          align-items: center;
        `}
      >
        <span
          css={css`
            text-align: right;
            font-size: 13px;
            font-weight: ${fontWeight.bold};
            line-height: 1.25;
            color: light-dark(${light.violet}, ${dark.white});
          `}
        >
          yak
          <Version>{YAK_BENCH.version}</Version>
        </span>
        <BarRow>
          <Track style={{ "--pct": 100 } as CSSProperties}>
            <YakBar>
              {/* % offsets are relative to the bar height, tuned so the yak straddles the bar's top edge */}
              <Image
                src={asset("/yak-riding-2.png")}
                alt=""
                width="810"
                height="647"
                css={css`
                  position: absolute;
                  right: -6px;
                  bottom: 66%;
                  height: 170%;
                  width: auto;
                `}
              />
            </YakBar>
            <YakValue>{YAK_BENCH.value}</YakValue>
          </Track>
        </BarRow>
        {BENCH_ROWS.map(({ label, version, value, percent }) => (
          <Fragment key={label}>
            <span
              css={css`
                text-align: right;
                font-size: 13px;
                line-height: 1.25;
              `}
            >
              {label}
              <Version>{version}</Version>
            </span>
            <BarRow>
              <Track style={{ "--pct": percent } as CSSProperties}>
                <Bar />
                <Value>{value}</Value>
              </Track>
            </BarRow>
          </Fragment>
        ))}
      </div>
    </figure>
  );
}

const BarRow = styled.div`
  position: relative;
  height: clamp(32px, 4.5cqi, 40px);
`;

const Track = styled.div`
  position: relative;
  height: 100%;
  container: benchtrack / inline-size;
`;

const barBox = css`
  position: relative;
  --value-column: ${VALUE_COLUMN};
  width: calc((100% - var(--value-column)) * var(--pct) / 100);
  height: 100%;
  border-radius: 10px;

  @container benchtrack (min-width: ${TRACK_HOLDS_NUMBERS}) {
    --value-column: 0px;
  }
`;

const Bar = styled.div`
  ${barBox};
  background: light-dark(${light.beige6}, ${dark.navy6});
`;

const YakBar = styled.div`
  ${barBox};
  background: light-dark(${light.red}, ${dark.redDeep});
`;

const valueText = css`
  position: absolute;
  top: 50%;
  right: 0;
  translate: 0 -50%;
  font-family: ${fonts.mono};
  font-size: 13px;
  white-space: nowrap;
`;

const Value = styled.span`
  ${valueText};
  font-weight: ${fontWeight.semibold};
  color: light-dark(${light.violet}, ${dark.white});

  @container benchtrack (min-width: ${TRACK_HOLDS_NUMBERS}) {
    right: auto;
    left: calc(100% * var(--pct) / 100);
    translate: -100% -50%;
    margin-left: -11px;
  }
`;

const YakValue = styled.span`
  ${valueText};
  font-weight: ${fontWeight.bold};
  color: light-dark(${light.red}, ${dark.red});

  @container benchtrack (min-width: ${TRACK_HOLDS_NUMBERS}) {
    right: auto;
    left: calc(100% * var(--pct) / 100);
    translate: -100% -50%;
    /* clear of the rider on the bar tip */
    margin-left: -16px;
    color: ${ink.fg};
  }
`;

const Version = styled.span`
  display: block;
  font-family: ${fonts.mono};
  font-size: 11px;
  font-weight: 400;
  color: light-dark(${light.violetSoft}, ${dark.fog});
`;
