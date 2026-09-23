import { css, keyframes, styled } from "next-yak";
import CtaButton from "../components/landing-page/cta-button";
import HeroEditor from "../components/landing-page/hero-editor";
import Badge from "../components/landing-page/badge";
import FeatureShowcase from "../components/landing-page/feature-showcase";
import Pipeline from "../components/landing-page/pipeline";
import Eyebrow from "../components/landing-page/eyebrow";
import SectionIntro, { SectionHeading, SubHeading } from "../components/landing-page/section-intro";
import { Container, Section } from "../components/landing-page/section";
import { FRAMEWORKS } from "../components/landing-page/framework-icons";
import { ArrowRightIcon, GitHubIcon } from "../components/landing-page/ui-icons";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  container,
  fonts,
  fontSize,
  fontWeight,
  headerHeight,
  ink,
  maxContentWidth,
  light,
  dark,
} from "@/tokens";
import Yak from "../components/landing-page/yak";
import Link from "next/link";
import Image from "next/image";
import { asset } from "@/lib/site";
import { externalLinkProps } from "@/lib/external-link";
import ExternalMark from "@/components/external-mark";
import { Fragment, type CSSProperties } from "react";

export default async function Home() {
  const version = await getReleasedVersion();

  return (
    <>
      {/* The hero pins in place while the performance section scrolls over it like a
          curtain; this wrapper bounds the stickiness so the hero is pushed back out
          of the viewport once it's fully covered (instead of staying pinned behind
          the whole page). */}
      <div>
        <section
          css={css`
            container: hero / inline-size;
            color: light-dark(${light.violet}, ${dark.white});
            /* keep the editor's floating mascot/terminal from forcing page-wide scroll */
            overflow-x: clip;

            /* Curtain effect: on desktop viewports tall enough to show the whole hero,
               pin it in place and let the next section slide over it. z-index: 0 makes
               the hero a single stacking unit so none of its layered internals paint
               through the covering section. */
            @media (min-width: ${container.hero.split}) and (min-height: 720px) {
              position: sticky;
              top: ${headerHeight};
              z-index: 0;
            }

            /* Depth cue while it's being covered: recede and dim over roughly the
               hero's own height of scroll (a fixed distance instead of a view timeline,
               which would already be mid-progress at load on tall viewports).
               Progressive enhancement — browsers without scroll-driven animations
               just get the pin. */
            @media (min-width: ${
              container.hero.split
            }) and (min-height: 720px) and (prefers-reduced-motion: no-preference) {
              @supports (animation-timeline: scroll()) {
                transform-origin: 50% 30%;
                animation: ${recede} linear both;
                animation-timeline: scroll(root);
                animation-range: 0px 720px;
              }
            }
          `}
        >
          <div
            css={css`
              display: flex;
              flex-direction: column;
              gap: 20px;
              padding: 48px 20px 64px;
              max-width: ${maxContentWidth};
              margin-inline: auto;

              @container hero (min-width: ${container.hero.split}) {
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                gap: 24px;
                padding: 48px 48px 96px;
              }
            `}
          >
            <div
              css={css`
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: 36px;

                @container hero (min-width: ${container.hero.split}) {
                  gap: 32px;
                }
              `}
            >
              <Eyebrow>🦀 zero-runtime · rust-powered</Eyebrow>
              <div
                css={css`
                  display: flex;
                  align-items: baseline;
                  gap: 22px;
                  padding-block: 8px 32px;
                `}
              >
                <h1
                  css={css`
                    /* spacing-only where supported: trims the descender space below the
                       baseline. The badge no longer relies on it — it baseline-aligns. */
                    text-box-trim: trim-end;
                    text-box-edge: cap alphabetic;
                    margin-right: 1rem;
                    font-family: ${fonts.title};
                    font-size: clamp(96px, 22cqi, 200px);
                    line-height: 0.82;
                    letter-spacing: -0.05em;
                  `}
                >
                  yak
                </h1>
                {/* The span/inline-block split matters: the row baseline-aligns the span,
                    whose baseline comes from its line box, and per CSS2.1 an inline-block
                    with overflow ≠ visible contributes its bottom edge as that baseline.
                    So the badge's bottom border lands exactly on the "yak" baseline in
                    every browser (text-box-trim isn't universal, and flex items no longer
                    synthesize baselines from their bottom edge). */}
                <span>
                  <Link
                    href="https://npmx.dev/package/next-yak"
                    {...externalLinkProps}
                    title={`next-yak${version ? ` v${version}` : ""} on npm`}
                    css={css`
                      display: inline-block;
                      overflow: hidden;
                      font-family: ${fonts.mono};
                      font-weight: ${fontWeight.bold};
                      font-size: 15px;
                      border: 2.5px solid light-dark(${light.violet}, ${dark.navy5});
                      border-radius: 10px;
                      padding: 5px 11px;
                      background: light-dark(${light.beige4}, ${dark.navy4});
                      font-variant-numeric: tabular-nums;

                      @media (prefers-reduced-motion: no-preference) {
                        transition:
                          color 0.15s ease,
                          border-color 0.15s ease;
                      }

                      &:hover,
                      &:focus-visible {
                        color: light-dark(${light.red}, ${dark.red});
                        border-color: light-dark(${light.red}, ${dark.red});
                      }
                    `}
                  >
                    {version ? `v${version}` : "npm"}
                  </Link>
                </span>
              </div>
              <p
                css={css`
                  max-width: 620px;
                  font-size: 20px;
                  line-height: 30px;
                `}
              >
                Write <b>styled-components</b> syntax, get build-time CSS extraction and full{" "}
                <b>RSC</b> compatibility. Use build-time CSS-in-JS without the hassle.
              </p>
              <ul
                css={css`
                  width: 100%;
                  display: flex;
                  align-items: flex-start;
                  align-content: flex-start;
                  gap: 9px 10px;
                  flex-wrap: wrap;

                  @container hero (min-width: ${container.hero.split}) {
                    margin-top: -8px;
                  }
                `}
              >
                {FRAMEWORKS.map(({ name, Icon }) => (
                  <Badge key={name}>
                    <Icon />
                    {name}
                  </Badge>
                ))}
              </ul>
              <div
                css={css`
                  display: flex;
                  flex-wrap: wrap;
                  gap: 16px;
                `}
              >
                <CtaButton href="/docs/getting-started" $primary>
                  Get started <ArrowRightIcon />
                </CtaButton>
                <CtaButton href="https://github.com/digitecgalaxus/next-yak" {...externalLinkProps}>
                  <GitHubIcon />
                  Github
                </CtaButton>
              </div>
            </div>

            <HeroEditor />
          </div>
        </section>
        <Section>
          <Container
            css={css`
              padding-top: clamp(48px, 7vw, 88px);
              padding-bottom: clamp(64px, 9vw, 112px);
            `}
          >
            <div
              css={css`
                display: grid;
                grid-template-columns: minmax(0, 1fr);
                align-items: center;
                gap: 40px;

                @container section (min-width: ${container.section.flow}) {
                  grid-template-columns: minmax(0, 4fr) minmax(0, 6fr);
                  gap: clamp(40px, 6cqi, 88px);
                }
              `}
            >
              <div
                css={css`
                  display: flex;
                  flex-direction: column;
                  align-items: flex-start;
                  gap: 16px;
                `}
              >
                <Eyebrow>performance · benchmarks</Eyebrow>
                <SectionHeading>
                  Fastest{" "}
                  <span
                    css={css`
                      white-space: nowrap;
                    `}
                  >
                    CSS-in-JS
                  </span>{" "}
                  solution
                </SectionHeading>
                <SubHeading
                  css={css`
                    max-width: 420px;
                  `}
                >
                  We built a comprehensive benchmark suite across the CSS-in-JS field.{" "}
                  <b>Yak pairs unmatched render performance with the most flexible API.</b> It is
                  always faster than runtime solutions like styled-components or emotion.
                </SubHeading>
                {/* The count comes from the benchmark site's own heading. Read it there before
                    you change this line, or the two stop agreeing. */}
                <a
                  href="https://jantimon.github.io/css-in-js-bench"
                  {...externalLinkProps}
                  css={css`
                    margin-top: 10px;
                    font-family: ${fonts.mono};
                    font-size: ${fontSize.small};
                    font-weight: ${fontWeight.bold};
                    /* A border rather than text-decoration: Chrome does not draw an
                       ancestor underline under an atomic inline box, so the line stopped
                       short of the arrow. The link is a flex item at flex-start, so the
                       border spans exactly the content, arrow included. */
                    text-decoration: none;
                    border-bottom: 1.5px solid currentColor;
                    padding-bottom: 1px;

                    &:hover,
                    &:focus-visible {
                      color: light-dark(${light.red}, ${dark.red});
                    }
                  `}
                >
                  See all 22 styling techniques
                  <ExternalMark />
                </a>
              </div>

              <figure
                css={css`
                  --card-bg: light-dark(${light.beige1}, ${dark.navy1});
                  --frame: light-dark(${light.violet}, ${dark.white});
                  --card-pad: clamp(16px, 3.5cqi, 36px);

                  position: relative;
                  background: var(--card-bg);
                  border: 1px solid light-dark(${light.beige5}, ${dark.navy5});
                  border-radius: 16px;
                  padding: clamp(16px, 3cqi, 28px) var(--card-pad) clamp(20px, 3.5cqi, 32px);
                `}
              >
                <figcaption
                  css={css`
                    display: flex;
                    /* on narrow cards the note drops to its own line instead of
                       breaking the title mid-phrase */
                    flex-wrap: wrap;
                    justify-content: space-between;
                    align-items: baseline;
                    gap: 4px 16px;
                    /* extra headroom so the rider on the winning bar stays clear of
                       the caption */
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
                      /* The note is 289px wide and ran past the card below 375px, which
                         is an iPhone SE. It wraps onto two even lines instead. */
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
                    /* fit-content instead of max-content so "styled-components" wraps
                       at its hyphen instead of widening the label column */
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
                        {/* Inside the bar, so the rider keeps to the bar tip in both
                            states. % offsets are relative to the bar height, so the pose
                            scales with it. `bottom` is tuned so the yak straddles the
                            bar's top edge with its leg draping over the face. */}
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
            </div>
          </Container>
        </Section>
      </div>
      <Section>
        <Container
          css={css`
            padding-top: clamp(56px, 7vw, 84px);
            padding-bottom: clamp(64px, 9vw, 104px);
          `}
        >
          <SectionIntro
            eyebrow="why teams pick it"
            title={
              <>
                Familiar on the surface.
                <br />
                Real CSS underneath.
              </>
            }
            css={css`
              align-items: center;
              text-align: center;
              margin-inline: auto;
            `}
          />

          <FeatureShowcase />
        </Container>
      </Section>
      <Section>
        <Container
          css={css`
            padding-top: clamp(48px, 6vw, 72px);
            padding-bottom: clamp(56px, 7vw, 80px);
          `}
        >
          <SectionIntro
            eyebrow="how it works"
            title="Tagged templates in. Real CSS out."
            css={css`
              max-width: 530px;
            `}
          >
            A Rust SWC plugin rewrites your styled components at compile time, inside whichever
            bundler you use. Static styles become a class; dynamic values ride on inline CSS
            variables.
          </SectionIntro>

          <Pipeline />
        </Container>
      </Section>
    </>
  );
}

// Read the shipped next-yak version from its package.json at build time, so the hero
// badge always reflects the package in the monorepo instead of a hardcoded string.
async function getReleasedVersion(): Promise<string | null> {
  let dir = process.cwd();
  for (;;) {
    try {
      const pkg = await readFile(path.join(dir, "packages", "next-yak", "package.json"), "utf-8");
      return JSON.parse(pkg).version as string;
    } catch {
      const parent = path.dirname(dir);
      if (parent === dir) return null; // reached the filesystem root without finding it
      dir = parent;
    }
  }
}

// "SSR throughput under load" from jantimon.github.io/css-in-js-bench, the "whole shop
// page" workload (400 product tiles). Requests per second, not renders per second: the
// numbers are two digits instead of six, and a reader can hold them in their head.
//
// yak is the styled API lane, which is the API this site documents. The css prop lane
// scores higher (218 req/s). Versions come from each lane's package.json in the
// benchmark repo. Read both off the site before you change a number here.
//
// `percent` is the library's share of yak's 205 req/s. yak's own bar spans the full
// chart column, so the bar-to-bar ratios are data-accurate.
const YAK_BENCH = { version: "9.10.0", value: "205" };

/**
 * The chart flips as one, not row by row: when the shortest bar can no longer hold its
 * number, every number steps out to a single column on the right.
 *
 * Every Track is the same width, so one container query on the Track answers for all six
 * rows. The container sits on the Track and not on the row or the grid, because `cqi`
 * inside a container resolves against that container. The row height and the grid gaps
 * stay measured against the section, where they were tuned.
 *
 * 178px is the track width at which the shortest bar, Emotion at 28.3 percent, reaches
 * the 50px its number needs. Work it out again when the data changes.
 */
const TRACK_HOLDS_NUMBERS = "178px";

/** The column the numbers stand in while they are outside the bars. */
const VALUE_COLUMN = "34px";

const BarRow = styled.div`
  position: relative;
  height: clamp(32px, 4.5cqi, 40px);
`;

const Track = styled.div`
  position: relative;
  height: 100%;
  container: benchtrack / inline-size;
`;

/**
 * The bars measure against the track minus the number column, so they share one scale in
 * both states and the ratios between them never move. `--pct` comes from the row data.
 */
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
  border: var(--card-bw) solid var(--frame);
`;

/** Right-aligned at the track's edge, which is where the numbers line up as a column. */
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

  /* inside, at the bar's own right edge */
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
    /* clear of the rider parked on the bar tip */
    margin-left: -16px;
    color: ${ink.fg};
  }
`;

/**
 * The version each library ran at, under its name rather than beside it. On one line
 * "styled-components 6.5.3" is 150px wide, which pushes the label column past its
 * 140px cap and takes the room the bars need on a narrow card.
 */
const Version = styled.span`
  display: block;
  font-family: ${fonts.mono};
  font-size: 11px;
  font-weight: 400;
  color: light-dark(${light.violetSoft}, ${dark.fog});
`;

const BENCH_ROWS = [
  { label: "StyleX", version: "0.19.0", value: "167", percent: 81.5 },
  { label: "tailwind-merge", version: "3.7.0", value: "105", percent: 51.2 },
  { label: "styled-components", version: "6.5.3", value: "80", percent: 39 },
  { label: "Panda", version: "2.0.0-beta.17", value: "76", percent: 37.1 },
  { label: "Emotion", version: "11.14.1", value: "58", percent: 28.3 },
];

const recede = keyframes`
  to {
    scale: 0.96;
    opacity: 0.45;
  }
`;
