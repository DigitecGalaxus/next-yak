import { css, keyframes, styled } from "next-yak";
import { CtaButton } from "../components/landing-page/button";
import HeroEditor from "../components/landing-page/hero-editor";
import FeatureShowcase from "../components/landing-page/feature-showcase";
import Pipeline from "../components/landing-page/pipeline";
import BenchmarkChart from "../components/landing-page/benchmark-chart";
import SectionIntro, {
  Eyebrow,
  SectionHeading,
  SubHeading,
} from "../components/landing-page/section-intro";
import { Container, Section } from "../components/landing-page/section";
import {
  NextIcon,
  QwikIcon,
  ReactIcon,
  RsbuildIcon,
  SolidIcon,
  ViteIcon,
} from "../components/landing-page/framework-icons";
import { ArrowRightIcon, GitHubIcon } from "../components/landing-page/ui-icons";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  container,
  fonts,
  fontSize,
  fontWeight,
  headerHeight,
  maxContentWidth,
  light,
  dark,
} from "@/tokens";
import Link from "next/link";
import { externalLinkProps } from "@/lib/external-link";
import ExternalMark from "@/components/external-mark";

const WORKS_WITH = [
  { name: "React", Icon: ReactIcon },
  { name: "Solid", Icon: SolidIcon },
  { name: "Qwik", Icon: QwikIcon },
  { name: "Next.js", Icon: NextIcon },
  { name: "Vite", Icon: ViteIcon },
  { name: "Rsbuild", Icon: RsbuildIcon },
];

export default async function Home() {
  const version = await getReleasedVersion();

  return (
    <>
      {/* Bounds the sticky hero, so it scrolls away once the next section covers it. */}
      <div>
        <section
          css={css`
            container: hero / inline-size;
            color: light-dark(${light.violet}, ${dark.white});
            /* the editor's floating decorations would cause page-wide scroll */
            overflow-x: clip;

            /* z-index: 0 makes the hero one stacking unit, so its layers do not paint
               through the covering section */
            @media (min-width: ${container.hero.split}) and (min-height: 720px) {
              position: sticky;
              top: ${headerHeight};
              z-index: 0;
            }

            /* a fixed scroll range, since a view timeline is already mid-progress at load
               on tall viewports */
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
                {/* An inline-block with overflow: hidden uses its bottom edge as baseline,
                    so the badge's bottom border lands on the "yak" baseline. */}
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
                {WORKS_WITH.map(({ name, Icon }) => (
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
                {/* The count must match the benchmark site's heading. */}
                <CtaButton
                  href="https://jantimon.github.io/css-in-js-bench"
                  {...externalLinkProps}
                  css={css`
                    margin-top: 18px;
                  `}
                >
                  See all 22 styling techniques
                  <ExternalMark />
                </CtaButton>
              </div>

              <BenchmarkChart />
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

async function getReleasedVersion(): Promise<string | null> {
  let dir = process.cwd();
  for (;;) {
    try {
      const pkg = await readFile(path.join(dir, "packages", "next-yak", "package.json"), "utf-8");
      return JSON.parse(pkg).version as string;
    } catch {
      const parent = path.dirname(dir);
      if (parent === dir) return null;
      dir = parent;
    }
  }
}

const Badge = styled.li`
  display: flex;
  padding: 6px 11px 6px 10px;
  align-items: center;
  gap: 7px;
  border: 1.5px solid light-dark(${light.beige5}, ${dark.navy5});
  border-radius: 8px;
  font-family: ${fonts.mono};
  font-size: ${fontSize.eyebrow};
`;

const recede = keyframes`
  to {
    scale: 0.96;
    opacity: 0.45;
  }
`;
