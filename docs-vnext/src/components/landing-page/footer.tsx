import { css, styled } from "next-yak";
import Link from "next/link";
import { fonts, fontSize, fontWeight, maxContentWidth, light, dark } from "@/tokens";
import { inlineCode, sectionLabel, chromeLink, proseLink } from "@/lib/mixins";
import { externalLinkProps } from "@/lib/external-link";
import Yak from "./yak";

const COLUMNS = [
  {
    title: "docs",
    links: [
      { label: "Getting started", href: "/docs/getting-started" },
      { label: "Features", href: "/docs/features" },
      { label: "How it works", href: "/docs/how-does-it-work" },
      { label: "FAQ", href: "/docs/faq" },
    ],
  },
  {
    title: "migrate",
    links: [
      { label: "From styled-components", href: "/docs/migration-from-styled-components" },
      { label: "To native CSS", href: "/docs/migration-to-native-css" },
      { label: "Comparison", href: "/docs/comparison" },
    ],
  },
  {
    title: "project",
    links: [
      { label: "Playground", href: "/playground" },
      { label: "GitHub", href: "https://github.com/DigitecGalaxus/next-yak", external: true },
      { label: "npm", href: "https://npmx.dev/package/next-yak", external: true },
      {
        label: "Releases",
        href: "https://github.com/DigitecGalaxus/next-yak/releases",
        external: true,
      },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      css={css`
        container: footer / inline-size;
        color: light-dark(${light.violet}, ${dark.white});
      `}
    >
      <Inner>
        <Brand>
          <div
            css={css`
              display: flex;
              align-items: center;
              gap: 14px;
            `}
          >
            <Yak
              css={css`
                width: 56px;
                height: auto;
              `}
            />
            <span
              css={css`
                font-family: ${fonts.title};
                font-size: 28px;
                letter-spacing: -0.5px;
              `}
            >
              yak
            </span>
          </div>
          <p
            css={css`
              max-width: 48ch;
              font-size: ${fontSize.small};
              line-height: 1.6;
            `}
          >
            <b>yak</b>, formerly <Code>next-yak</Code>. Same library, same team, broader home: the
            package is now <Code>@yak/react</Code>, with <Code>@yak/solid</Code> and{" "}
            <Code>@yak/qwik</Code> beside it.{" "}
            <StoryLink href="/blog/renaming-next-yak-to-yak">Read the story</StoryLink>
          </p>
        </Brand>

        {COLUMNS.map((column) => (
          <Column key={column.title}>
            <ColumnTitle>{column.title}</ColumnTitle>
            <ul
              css={css`
                display: flex;
                flex-direction: column;
                gap: 10px;
                list-style: none;
              `}
            >
              {column.links.map((link) => (
                <li key={link.href}>
                  <FooterLink
                    href={link.href}
                    {...("external" in link && link.external ? externalLinkProps : {})}
                  >
                    {link.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </Column>
        ))}

        <Legal>MIT licensed. Made by Digitec Galaxus.</Legal>
      </Inner>
    </footer>
  );
}

const Inner = styled.div`
  max-width: ${maxContentWidth};
  margin-inline: auto;
  padding: clamp(48px, 6vw, 72px) clamp(20px, 5vw, 48px) clamp(32px, 4vw, 48px);
  display: grid;
  grid-template-columns: 1fr;
  gap: 36px 40px;

  @container footer (min-width: 560px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @container footer (min-width: 900px) {
    grid-template-columns: minmax(0, 2.2fr) repeat(3, minmax(180px, 1fr));
  }
`;

const Brand = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;

  @container footer (min-width: 560px) {
    grid-column: 1 / -1;
  }

  @container footer (min-width: 900px) {
    grid-column: auto;
  }
`;

const StoryLink = styled(Link)`
  ${proseLink};
  font-weight: ${fontWeight.bold};
  white-space: nowrap;
`;

const Code = styled.code`
  ${inlineCode};
  white-space: nowrap;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ColumnTitle = styled.span`
  ${sectionLabel};
`;

const FooterLink = styled(Link)`
  ${chromeLink};
  font-size: ${fontSize.small};
  color: light-dark(${light.violet}, ${dark.white});
`;

const Legal = styled.p`
  grid-column: 1 / -1;
  padding-top: 24px;
  border-top: 1px solid light-dark(${light.beige5}, ${dark.navy5});
  font-family: ${fonts.mono};
  font-size: 13px;
  color: light-dark(${light.violetSoft}, ${dark.fog});
`;
