import type { SVGProps } from "react";
import { Icon } from "@/components/icon";

export function ZeroRuntimeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon size={22} viewBox="0 0 24 24" style={{ fill: "light-dark(#f2462e, #ff5d45)" }} {...props}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
    </Icon>
  );
}

export function SyntaxIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon
      size={22}
      viewBox="0 0 24 24"
      style={{ stroke: "light-dark(#1f0a4d, #f4eee4)" }}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m9 8-4 4 4 4M15 8l4 4-4 4" />
    </Icon>
  );
}

export function RealCssIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon
      size={22}
      viewBox="0 0 24 24"
      style={{ stroke: "light-dark(#8b5cf6, #a78bfa)" }}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
      <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
    </Icon>
  );
}

export function TypeSafeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon
      size={22}
      viewBox="0 0 24 24"
      style={{ stroke: "light-dark(#0fb5b5, #2dd4bf)" }}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18M15 3v18" />
    </Icon>
  );
}

export function FrameworkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon size={22} viewBox="0 0 24 24" style={{ fill: "light-dark(#0fb5b5, #2dd4bf)" }} {...props}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </Icon>
  );
}

export function RustIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon
      size={22}
      viewBox="0 0 24 24"
      style={{ stroke: "light-dark(#1f0a4d, #f4eee4)" }}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
    </Icon>
  );
}
