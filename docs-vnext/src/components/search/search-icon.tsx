import type { SVGProps } from "react";
import { Icon } from "@/components/icon";

export function SearchIcon(props: SVGProps<SVGSVGElement> & { size?: number | string }) {
  return (
    <Icon viewBox="0 0 16 16" {...props}>
      <path
        d="M7.33341 12C9.91074 12 12.0001 9.91066 12.0001 7.33333C12.0001 4.756 9.91074 2.66666 7.33341 2.66666C4.75609 2.66666 2.66675 4.756 2.66675 7.33333C2.66675 9.91066 4.75609 12 7.33341 12Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M14 14L11.1333 11.1333" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </Icon>
  );
}
