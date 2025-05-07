import { css, keyframes, styled } from "next-yak";
import { AnimatedCode } from "./animatedCode";
import { breakpoints, colors, theme } from "@/lib/utils/constants";
import NextLink from "next/link";
import NextImage from "next/image";
import yakJumping from "@/public/img/yak-jumping.png";
import { ErrorBoundary } from "./errorBoundary";

export const LandingPage = () => {
  return (
    <Article>
      <div
        css={css`
          display: flex;
          flex-direction: column-reverse;

          ${breakpoints.md} {
            align-items: last baseline;
            flex-direction: row;
            gap: 4rem;
          }
        `}
      >
        <Title>Next-Yak</Title>
        <Image src={yakJumping} alt="Image of yak coding" priority />
      </div>
      <Description>
        <p>
          🦀 Zero-runtime CSS-in-JS powered by Rust. Write styled-components
          syntax, get build-time CSS extraction and full RSC compatibility.
        </p>
      </Description>

      <LinkArea>
        <PrimaryLink href={"/docs/getting-started"}>
          Get started
          <Svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 4.1 12 6" />
            <path d="m5.1 8-2.9-.8" />
            <path d="m6 12-1.9 2" />
            <path d="M7.2 2.2 8 5.1" />
            <path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z" />
          </Svg>
        </PrimaryLink>
        <SecondaryLink href={"https://github.com/jantimon/next-yak"}>
          Github
          <Svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </Svg>
        </SecondaryLink>
      </LinkArea>

      <Subtitle>Performance</Subtitle>
      <p
        style={{
          marginBottom: "1rem",
        }}
      >
        Validated across many thousands of real-world users:
      </p>
      <List>
        <li>&gt;20% faster navigational LCP</li>
        <li>&gt;15% reduced server latency</li>
        <li>&gt;10% faster INP</li>
      </List>
      <p
        style={{
          marginTop: "-2rem",
        }}
      >
        Get started and profit from these improvements without any significant
        increase in build times.
      </p>

      <Subtitle>Features</Subtitle>
      <List>
        <li>
          <EnumTitle>NextJs Compatibility</EnumTitle>
          Works smoothly with both React Server and Client Components
        </li>
        <li>
          <EnumTitle>Build-time CSS</EnumTitle>
          Reduces load time by handling CSS during the build phase, using
          Next.js built-in CSS Modules features
        </li>
        <li>
          <EnumTitle>Lightweight Runtime</EnumTitle>
          Operates with minimal impact, simply changing CSS classes without
          modifying the CSSOM
        </li>
        <li>
          <EnumTitle>Standard CSS Syntax</EnumTitle>
          Write styles in familiar, easy-to-use CSS
        </li>
        <li>
          <EnumTitle>Integrates with Atomic CSS</EnumTitle>
          Easily combines with atomic CSS frameworks like Tailwind CSS for more
          design options
        </li>
        <li>
          <EnumTitle>No significant build-time overhead</EnumTitle>
          Doesn't increase the build time significantly, by only transforming
          statically as much as possible without the need to evaluate arbitrary
          JavaScript.
        </li>
      </List>
      <ErrorBoundary fallback={null}>
        <AnimatedCode />
      </ErrorBoundary>
    </Article>
  );
};

const Article = styled.article`
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 80ch;
  margin-inline: auto;
  padding: 2rem 1rem;
`;

const Title = styled.h1`
  font-size: 5rem;
  font-weight: 400;

  background: #000;
  background: radial-gradient(
    circle farthest-corner at top left,
    #000 0%,
    #333 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  ${theme.dark} {
    background: #fff;
    background: radial-gradient(
      circle farthest-corner at top left,
      #ffffff 0%,
      #cccccc 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Image = styled(NextImage)`
  width: 256px;
  ${breakpoints.md} {
    transform: scaleX(-1);
  }
`;

const Description = styled.div`
  margin-block-end: 2rem;
  ${breakpoints.md} {
    margin-block: 1.5rem;
  }
`;

const LinkArea = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
`;

const clickScale = keyframes`
  from {
    transform: scale(1);
  }
  to {
    transform: scale(0.8);
  }
`;

const PrimaryLink = styled(NextLink)`
  display: inline-flex;
  align-items: center;
  border-radius: 12px;
  padding: 8px;
  padding-inline-start: 16px;
  ${colors.primary};

  &:hover svg {
    animation: ${clickScale} 0.3s alternate;
    animation-timing-function: linear(
      0,
      0.351 9%,
      0.626 18.3%,
      0.832 28.1%,
      0.909 33.2%,
      0.971 38.5%,
      1.013 43.3%,
      1.043 48.4%,
      1.062 53.8%,
      1.07 59.5%,
      1.063 68.8%,
      1.011 90.3%,
      1
    );
  }
`;

const SecondaryLink = styled(NextLink)`
  display: inline-flex;
  align-items: center;
  border-radius: 12px;
  padding: 8px;
  padding-inline-start: 16px;
  ${colors.secondary};

  &:hover svg {
    transform: translateX(4px);
    transition: transform 0.15s ease-in-out;
  }
`;

const Subtitle = styled.h2`
  font-size: 2rem;
  font-weight: 400;
  margin: 2rem 0 1rem;
  text-align: left;
`;

const List = styled.ul`
  list-style-type: disc;
  margin-left: 2rem;
  margin-bottom: 2rem;

  & li {
    margin-bottom: 1rem;
  }
`;

const EnumTitle = styled.div`
  font-weight: 600;
`;

const Svg = styled.svg`
  height: 0.7lh;
`;
