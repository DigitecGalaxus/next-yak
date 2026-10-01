import type { SVGProps } from "react";

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
