import type { SVGProps } from "react";
import { Icon } from "@/components/icon";

// Simplified brand marks for the "works with" badges — recognizable approximations,
// swap for the official logos when convenient.

export function WebpackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon viewBox="0 0 15 15" {...props}>
      <path
        d="M7.5 0.7 13.4 4.1 13.4 10.9 7.5 14.3 1.6 10.9 1.6 4.1Z"
        fill="#8ED6FB"
        fillOpacity="0.35"
        stroke="#1C78C0"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 4 10.6 5.75 10.6 9.25 7.5 11 4.4 9.25 4.4 5.75Z"
        fill="#1C78C0"
        fillOpacity="0.5"
        stroke="#1C78C0"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function StorybookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon viewBox="0 0 15 15" {...props}>
      <rect x="2.3" y="1" width="10.4" height="13" rx="1.8" fill="#FF4785" />
      <path d="M5.6 1 5.6 4.3 6.85 3.4 8.1 4.3 8.1 1Z" fill="#fff" />
      <path
        d="M9 6.2a1.3 1.3 0 1 0 -2 1.15"
        stroke="#fff"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      />
    </Icon>
  );
}
