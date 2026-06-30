import { colors, status } from "@/tokens";
import { styled } from "next-yak";
import type { ReactNode } from "react";

type CalloutType = "info" | "warn" | "error";

// Accent (icon + ring) and soft fill per type, both from the shared `status` palette so
// callouts, code-block diff lines, and the comparison table stay in agreement.
const TONE: Record<CalloutType, { accent: string; bg: string }> = {
  info: { accent: status.info, bg: status.infoBg },
  warn: { accent: status.warn, bg: status.warnBg },
  error: { accent: status.error, bg: status.errorBg },
};

// Outline + brutalist shadow color. A local light-dark pair, not the violet token: the dark
// half is intentionally a dimmer lavender so the near-white ink isn't harsh on the dark page.
const edge = "light-dark(#1f0a4d, #8a7fae)";

const ICONS: Record<CalloutType, ReactNode> = {
  info: <InfoGlyph />,
  warn: <WarnGlyph />,
  error: <ErrorGlyph />,
};

export function Callout({
  type = "info",
  title,
  children,
}: {
  type?: CalloutType;
  title?: ReactNode;
  children: ReactNode;
}) {
  const { accent, bg } = TONE[type] ?? TONE.info;
  return (
    <Box $bg={bg} role={type === "error" ? "alert" : "note"}>
      <IconRing $accent={accent} aria-hidden="true">
        {ICONS[type] ?? ICONS.info}
      </IconRing>
      {title ? <Title>{title}</Title> : null}
      {children}
    </Box>
  );
}

// The ring supplies the circle, so info/error are bare glyphs (circled-i / circled-×);
// warn keeps its triangle for a distinct caution shape.
function InfoGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 10.5v6" />
      <path d="M12 7h.01" />
    </svg>
  );
}

function WarnGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4 20.6 19.5H3.4Z" />
      <path d="M12 10.5v4" />
      <path d="M12 17.3h.01" />
    </svg>
  );
}

function ErrorGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" />
    </svg>
  );
}

const Box = styled.aside<{ $bg: string }>`
  position: relative;
  margin: 26px 0;
  /* left gutter + top room so the corner ring never collides with the first line */
  padding: 16px 18px 16px 28px;
  border: 2px solid ${edge};
  border-radius: 10px;
  background: ${({ $bg }) => $bg};
  box-shadow: 3px 3px 0 0 ${edge};
  color: ${colors.violet};

  & > :last-child {
    margin-bottom: 0;
  }
`;

// A badge straddling the top-left corner: ink ring over a page-coloured fill with the accent
// glyph. The slightly detached look is intentional, even when it overhangs a neighbour's shadow.
const IconRing = styled.span<{ $accent: string }>`
  position: absolute;
  top: 1px;
  left: 1px;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 2px solid ${edge};
  border-radius: 50%;
  background: ${colors.beige};
  color: ${({ $accent }) => $accent};

  & svg {
    width: 22px;
    height: 22px;
  }
`;

const Title = styled.p`
  margin: 0 0 4px;
  font-weight: 700;
`;
