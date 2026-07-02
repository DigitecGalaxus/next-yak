import Link from "next/link";
import type { Item } from "fumadocs-core/page-tree";
import { css, styled } from "next-yak";
import { colors, fonts, fontWeight } from "@/tokens";
import { buttonStyles } from "@/components/landing-page/button";

/** Previous / next page links, derived from `findNeighbour(tree, url)`. */
export default function PageFooter({ previous, next }: { previous?: Item; next?: Item }) {
  if (!previous && !next) return null;

  return (
    <Footer>
      {previous ? (
        <Card href={previous.url} $align="start">
          <Direction>← Previous</Direction>
          <Name>{previous.name}</Name>
        </Card>
      ) : (
        <span />
      )}
      {next ? (
        <Card href={next.url} $align="end">
          <Direction>Next →</Direction>
          <Name>{next.name}</Name>
        </Card>
      ) : (
        <span />
      )}
    </Footer>
  );
}

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 64px;
`;

const Card = styled(Link)<{ $align: "start" | "end" }>`
  ${buttonStyles};

  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  max-width: 320px;
  padding: 14px 18px;
  text-decoration: none;

  ${({ $align }) =>
    $align === "end" &&
    css`
      align-items: flex-end;
      text-align: right;
    `}
`;

const Direction = styled.span`
  font-family: ${fonts.mono};
  color: ${colors.violetLight};
  font-size: 13px;
`;

const Name = styled.span`
  font-size: 15px;
  font-weight: ${fontWeight.semibold};
  color: ${colors.violet};
`;
