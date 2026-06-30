import type { SVGProps } from "react";

/**
 * Shared `<svg>` wrapper for the icon set — centralizes the `xmlns`, the square
 * `width`/`height` (via `size`), the `viewBox`, and the `fill="none"` default that
 * every icon otherwise repeats by hand. Spread props win, so any icon can override
 * the size (pass `width`/`height` for non-square marks) or the fill.
 */
export function Icon({
  size = 15,
  viewBox,
  fill = "none",
  children,
  ...props
}: SVGProps<SVGSVGElement> & { viewBox: string; size?: number | string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {children}
    </svg>
  );
}
