import type { SVGProps } from "react";
import { Icon } from "@/components/icon";

// Simplified brand marks — recognizable approximations, swap for the official logos when
// convenient. Like the framework icons, `mono` gives a single-colour version that
// inherits `currentColor`, for switcher pills where brand colours would fight the chrome.

type ToolIconProps = SVGProps<SVGSVGElement> & { mono?: boolean };

export function StorybookIcon({ mono, ...props }: ToolIconProps) {
  return (
    <Icon viewBox="0 0 15 15" {...props}>
      <rect
        x="2.3"
        y="1"
        width="10.4"
        height="13"
        rx="1.8"
        fill={mono ? "none" : "#FF4785"}
        stroke={mono ? "currentColor" : undefined}
        strokeWidth={mono ? 1.1 : undefined}
      />
      <path d="M5.6 1 5.6 4.3 6.85 3.4 8.1 4.3 8.1 1Z" fill={mono ? "currentColor" : "#fff"} />
      <path
        d="M9 6.2a1.3 1.3 0 1 0 -2 1.15"
        stroke={mono ? "currentColor" : "#fff"}
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      />
    </Icon>
  );
}
