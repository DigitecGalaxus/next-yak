import type { ReactNode, SVGProps } from "react";
import { Icon } from "@/components/icon";

// File-type badges for the tab title bar. Fixed brand colors so they read on the
// always-navy editor card in both themes.

export function TypeScriptIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon viewBox="0 0 16 16" {...props}>
      <rect width="16" height="16" rx="2.5" fill="#3178C6" />
      <text
        x="8.2"
        y="11"
        textAnchor="middle"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="7.5"
        fontWeight="700"
        fill="#fff"
      >
        TS
      </text>
    </Icon>
  );
}

export function JavaScriptIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon viewBox="0 0 16 16" {...props}>
      <rect width="16" height="16" rx="2.5" fill="#F7DF1E" />
      <text
        x="8.2"
        y="11"
        textAnchor="middle"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="7.5"
        fontWeight="700"
        fill="#000"
      >
        JS
      </text>
    </Icon>
  );
}

/**
 * Maps a tab value to a TS/JS file badge: tabs are languages (typescript/javascript) or files
 * (`*.config.ts`); anything without a clear file type (package managers, bundlers, i/o views) gets none.
 */
export function iconForTab(value: string): ReactNode | null {
  const v = value.trim().toLowerCase();
  if (v === "typescript" || /\.(ts|mts|cts|tsx)$/.test(v)) return <TypeScriptIcon />;
  if (v === "javascript" || /\.(js|mjs|cjs|jsx)$/.test(v)) return <JavaScriptIcon />;
  return null;
}
