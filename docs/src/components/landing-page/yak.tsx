import type { CSSProperties } from "react";
import Image from "next/image";
import { styled } from "@yak/react";
import { asset } from "@/lib/site";

// A raster file, not inline SVG: the vector mark is 200 kB of paths, and inline it ships in
// the HTML and the RSC payload of each page. The WebP is 168px wide and sharp up to 56px.
export default function Yak({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <Logo
      src={asset("/yak-logo.webp")}
      alt=""
      width={168}
      height={122}
      loading="eager"
      className={className}
      style={style}
    />
  );
}

const Logo = styled(Image)`
  height: auto;
`;
