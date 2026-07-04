import { css, keyframes, styled } from "next-yak";
import CtaButton from "../components/landing-page/cta-button";
import CodePanel from "../components/landing-page/code-panel";
import HeroEditor from "../components/landing-page/hero-editor";
import Badge from "../components/landing-page/badge";
import Code from "../components/landing-page/code";
import Feature from "../components/landing-page/feature";
import Step from "../components/landing-page/step";
import StatCard from "../components/landing-page/stat-card";
import Bar from "../components/landing-page/bench-bar";
import { cardStyles } from "../components/landing-page/card";
import Eyebrow from "../components/landing-page/eyebrow";
import SectionIntro, { SectionHeading, SubHeading } from "../components/landing-page/section-intro";
import Coverage from "../components/landing-page/coverage";
import { Container, Section } from "../components/landing-page/section";
import { FRAMEWORKS } from "../components/landing-page/framework-icons";
import { ArrowRightIcon, FlowArrowIcon, GitHubIcon } from "../components/landing-page/ui-icons";
import {
  ZeroRuntimeIcon,
  SyntaxIcon,
  RealCssIcon,
  TypeSafeIcon,
  FrameworkIcon,
  RustIcon,
} from "../components/landing-page/feature-icons";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  container,
  fonts,
  fontWeight,
  headerHeight,
  maxContentWidth,
  light,
  dark,
} from "@/tokens";
import Yak from "../components/landing-page/yak";
import Link from "next/link";

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
            @media (min-width: ${container.hero.split}) and (min-height: 720px) and (prefers-reduced-motion: no-preference) {
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
                    target="_blank"
                    rel="noopener noreferrer"
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
                <CtaButton href="/documentation/getting-started" $primary>
                  Get started <ArrowRightIcon />
                </CtaButton>
                <CtaButton href="https://github.com/digitecgalaxus/next-yak">
                  <GitHubIcon />
                  Github
                </CtaButton>
              </div>
            </div>

            <HeroEditor />
          </div>
        </section>
        <Section background={`light-dark(${light.beige3}, ${dark.navy3})`} wave>
          <Container
            css={css`
              padding-top: clamp(44px, 6vw, 56px);
              padding-bottom: clamp(60px, 9vw, 96px);
            `}
          >
            <SectionIntro
              eyebrow="performance"
              title="Faster than styled-components on every benchmark."
              css={css`
                max-width: 450px;
              `}
            >
              The same API you already write, compiled to zero runtime in the browser. A drop-in swap
              that's measurably faster.
            </SectionIntro>

            <div
              css={css`
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 16px;

                @container section (min-width: ${container.section.statGrid}) {
                  grid-template-columns: repeat(4, 1fr);
                }
              `}
            >
              <StatCard value="14" suffix="/14" description="won every case in our SSR benchmark" />
              <StatCard
                value="3.8"
                suffix="×"
                description="more renders/sec, static components"
                accent
              />
              <StatCard value="4.3" suffix="×" description="more renders/sec, css-prop styling" />
              <StatCard value="~2.8" suffix="KB" description="gzipped runtime, the whole library" />
            </div>

            <figure
              css={css`
                ${cardStyles};
                padding: 32px 24px;
                border-radius: 16px;

                & p {
                  font-size: 13px;
                }
              `}
            >
              <figcaption
                css={css`
                  display: flex;
                  flex-direction: column;
                  gap: 4px;

                  @container section (min-width: ${container.section.figureRow}) {
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: baseline;
                    gap: 16px;
                  }
                `}
              >
                <span
                  css={css`
                    font-weight: ${fontWeight.bold};
                    color: light-dark(${light.violet}, ${dark.white});
                  `}
                >
                  Static components: renders per second
                </span>
                <span
                  css={css`
                    font-family: ${fonts.mono};
                    font-size: 13px;
                    white-space: nowrap;
                  `}
                >
                  renders / sec · higher is better
                </span>
              </figcaption>
              <p
                css={css`
                  margin-top: 8px;
                  max-width: 600px;
                `}
              >
                The test: each library renders the same component repeatedly on the server (Node,
                production build). These are micro-benchmarks, they isolate the library's own render
                cost and nothing else.
              </p>
              <div
                css={css`
                  margin-top: 24px;

                  & > * + * {
                    margin-top: 14px;
                  }
                `}
              >
                <Bar label="Yak CSS" value="3,151" percent={100} accent />
                <Bar label="Vanilla JSX · no library" value="2,160" percent={68.5} />
                <Bar label="styled-components" value="819" percent={26} />
              </div>
              <p
                css={css`
                  margin-top: 24px;
                `}
              >
                SSR extraction runs up to <b>~13× faster</b>. Static components even outrun
                hand-written vanilla JSX — one hot, JIT-optimized path beats a thousand cold ones.
              </p>
            </figure>
          </Container>
        </Section>
      </div>
      <Section background={`light-dark(${light.beige2}, ${dark.navy2})`}>
        <Container
          css={css`
            padding-top: clamp(56px, 7vw, 84px);
            padding-bottom: clamp(64px, 9vw, 104px);
          `}
        >
          <SectionIntro
            eyebrow="why teams pick it"
            title="Familiar on the surface. Real CSS underneath."
            css={css`
              max-width: 550px;
            `}
          >
            The styled-components syntax you already know — nesting, keyframes, media queries and
            all — compiled to static CSS with zero runtime in production.
          </SectionIntro>

          <ul
            css={css`
              display: grid;
              grid-template-columns: 1fr;
              gap: 1px;
              background: light-dark(${light.beige4}, ${dark.navy4});
              border: 1px solid light-dark(${light.beige4}, ${dark.navy4});
              border-radius: 16px;
              overflow: hidden;
              list-style: none;

              @container section (min-width: ${container.section.twoCol}) {
                grid-template-columns: repeat(2, 1fr);
              }

              @container section (min-width: ${container.section.threeCol}) {
                grid-template-columns: repeat(3, 1fr);
              }
            `}
          >
            <Feature title="Zero runtime, RSC-ready" icon={<ZeroRuntimeIcon />}>
              Every style at build. No styling library ships to the client, and there's no “use
              client” boundary just to style a server component.
            </Feature>
            <Feature title="A syntax you already know" icon={<SyntaxIcon />}>
              Tagged template literals, prop interpolation, the <Code>css</Code> helper. It's
              styled-components down to the import, so migration is mostly changing one line.
            </Feature>
            <Feature title="Real CSS, fully" icon={<RealCssIcon />}>
              Nesting, keyframes, media queries, and same-file targeting like{" "}
              <Code>{"${Other}:hover"}</Code>. Plus new CSS like <Code>@container</Code> and{" "}
              <Code>:has()</Code> the day the browser ships it, never gated behind a library update.
            </Feature>
            <Feature title="Type-safe props" icon={<TypeSafeIcon />}>
              Typed generics flow into your templates, so a bad <Code>$primary</Code> is a compile
              error, not a runtime surprise.
            </Feature>
            <Feature title="Framework-agnostic" icon={<FrameworkIcon />}>
              One plugin, many bundlers. Next.js, Vite, react-router and TanStack Start all build
              the same extracted CSS.
            </Feature>
            <Feature title="Rust-powered" icon={<RustIcon />}>
              Although yak focuses on max user performance, yaks rust compiler makes it also blazing
              fast during development.
            </Feature>
          </ul>
        </Container>
      </Section>
      <Section background={`light-dark(${light.beige3}, ${dark.navy3})`} wave>
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
            A Rust SWC plugin rewrites your styled components at compile time. Static styles become
            a class; dynamic values ride on inline CSS variables.
          </SectionIntro>

          <div
            css={css`
              display: grid;
              gap: 24px;
              grid-template-columns: 1fr;

              & > *:nth-child(6) {
                display: none;
              }

              /* wide enough: reflow into [code · plugin · code] over the 3 steps */
              @container section (min-width: ${container.section.flow}) {
                grid-template-columns: repeat(3, 1fr);

                & > *:nth-child(1) {
                  order: 4;
                } /* Step 1 — Write */
                & > *:nth-child(2) {
                  order: 1;
                } /* code in — Button.tsx */
                & > *:nth-child(3) {
                  order: 5;
                } /* Step 2 — Compile */
                & > *:nth-child(4) {
                  order: 6;
                } /* Step 3 — Ship */
                & > *:nth-child(5) {
                  order: 3;
                } /* code out */
                & > *:nth-child(6) {
                  order: 2;
                  display: flex;
                } /* plugin / arrow */
              }
            `}
          >
            <Step n={1} title="Write">
              Author components with the styled API you already know.
            </Step>
            <PanelColumn>
              <CodePanel title="Button.tsx" blocks={[{ code: WRITE_CODE, lang: "tsx" }]} />
            </PanelColumn>
            <Step n={2} title="Compile">
              The Rust SWC plugin extracts static styles into a CSS file.
            </Step>
            <Step n={3} title="Ship">
              Browser loads a plain stylesheet. No styling runtime.
            </Step>
            <PanelColumn>
              <CodePanel
                title="Button.css"
                blocks={[
                  { code: OUTPUT_CSS, lang: "css" },
                  { code: SHIP_HTML, lang: "tsx" },
                ]}
              />
            </PanelColumn>
            <div
              css={css`
                display: flex;
                flex: 0 0 auto;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 14px;
                padding: 0 8px;
                font-family: ${fonts.mono};
                font-size: 13px;
              `}
            >
              <span
                css={css`
                  font-weight: 700;
                  letter-spacing: 0.88px;
                  white-space: nowrap;
                `}
              >
                RUST SWC PLUGIN
              </span>
              <FlowArrowIcon />
              <span
                css={css`
                  letter-spacing: 0.44px;
                `}
              >
                build time
              </span>
            </div>
          </div>
        </Container>
      </Section>
      <Section background={`light-dark(${light.beige2}, ${dark.navy2})`}>
        <Container
          css={css`
            padding-top: clamp(56px, 7vw, 84px);
            padding-bottom: clamp(64px, 9vw, 104px);
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
            <Eyebrow>coverage</Eyebrow>
            <SectionHeading>
              One API.
              <br />
              Every bundler that matters.
            </SectionHeading>
            <SubHeading
              css={css`
                max-width: 460px;
              `}
            >
              yak compiles to a plain stylesheet, so it fits the stack you already use. Choose your
              framework to see the bundlers and meta-frameworks it works with.
            </SubHeading>
          </div>
          <Coverage />
        </Container>
      </Section>
      <Section background={`light-dark(${light.beige3}, ${dark.navy3})`} wave="top">
        <Container
          css={css`
            padding-top: clamp(56px, 7vw, 80px);
            padding-bottom: clamp(64px, 8vw, 96px);
          `}
        >
          <div
            css={css`
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              gap: 28px;

              @container section (min-width: ${container.section.splitRow}) {
                flex-direction: row;
                align-items: center;
                gap: 48px;
              }
            `}
          >
            <div
              css={css`
                display: flex;
                flex: 0 0 auto;
                align-items: center;
                gap: 18px;
              `}
            >
              <Yak
                css={css`
                  width: 120px;
                  height: auto;
                `}
              />
              <div
                css={css`
                  display: flex;
                  flex-direction: column;
                  gap: 2px;
                  font-family: ${fonts.mono};
                `}
              >
                <span
                  css={css`
                    font-size: 13px;
                    color: light-dark(${light.violetSoft}, ${dark.fog});
                  `}
                >
                  next-yak
                </span>
                <span
                  css={css`
                    font-size: 18px;
                    font-weight: ${fontWeight.bold};
                    color: light-dark(${light.violet}, ${dark.white});
                  `}
                >
                  → Yak CSS
                </span>
              </div>
            </div>
            <div
              css={css`
                display: flex;
                flex: 1;
                min-width: 0;
                flex-direction: column;
                align-items: flex-start;
                gap: 16px;
              `}
            >
              <Eyebrow>the rename</Eyebrow>
              <SectionHeading>It outgrew the name.</SectionHeading>
              <SubHeading>
                We started as next-yak — built first for Next.js. But the project now spans React,
                Solid, and Qwik across every modern bundler. Tying the name to one framework
                undersold the reach.
              </SubHeading>
              <p
                css={css`
                  line-height: 24px;
                `}
              >
                So it's <b>Yak CSS</b> now. Same library, same team, broader home.{" "}
                {/* TODO: point at a dedicated rename/story page once it exists */}
                <a
                  href="/documentation/getting-started"
                  css={css`
                    color: light-dark(${light.red}, ${dark.red});
                    font-weight: ${fontWeight.bold};
                  `}
                >
                  Read the full story →
                </a>
              </p>
            </div>
          </div>
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

const WRITE_CODE = `const Button = styled.button\`
  font-size: 1.5em;
  color: palevioletred;
  &:hover { color: red; }
\`;`;

const OUTPUT_CSS = `.button_x7a {
  font-size: 1.5em;
  color: palevioletred;
}
.button_x7a:hover { color: red; }`;

const SHIP_HTML = `<button class="button_x7a" />`;

const PanelColumn = styled.div`
  flex: 1;
  min-width: 0;
`;

const recede = keyframes`
  to {
    scale: 0.96;
    opacity: 0.45;
  }
`;
