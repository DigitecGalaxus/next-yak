import { status, light, dark } from "@/tokens";
import { styled } from "next-yak";
import type { ReactNode } from "react";

type CalloutType = "info" | "warn" | "error";

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
  const accent = status[type] ?? status.info;
  return (
    <Box
      $bg={`color-mix(in srgb, ${accent} 12%, transparent)`}
      role={type === "error" ? "alert" : "note"}
    >
      <IconRing $accent={accent} aria-hidden="true">
        {ICONS[type] ?? ICONS.info}
      </IconRing>
      {title ? <Title>{title}</Title> : null}
      {children}
    </Box>
  );
}

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
  padding: 16px 18px 16px 28px;
  border: 2px solid light-dark(${light.violet}, ${dark.edge});
  border-radius: 10px;
  background: ${({ $bg }) => $bg};
  box-shadow: 3px 3px 0 0 light-dark(${light.violet}, ${dark.edge});
  color: light-dark(${light.violet}, ${dark.white});

  & > :last-child {
    margin-bottom: 0;
  }
`;

const IconRing = styled.span<{ $accent: string }>`
  position: absolute;
  top: 1px;
  left: 1px;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 2px solid light-dark(${light.violet}, ${dark.edge});
  border-radius: 50%;
  background: light-dark(${light.beige2}, ${dark.navy2});
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
