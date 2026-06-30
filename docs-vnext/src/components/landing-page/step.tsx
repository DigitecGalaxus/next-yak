import { css } from "next-yak";
import type { CSSProperties, ReactNode } from "react";
import { colors, container, fontSize, fontWeight, radii } from "@/tokens";
import { subsectionHeading } from "@/lib/mixins";

export default function Step({
  n,
  title,
  className,
  style,
  children,
}: {
  n: number;
  title: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      className={className}
      style={style}
      css={css`
        display: flex;
        flex-direction: column;
        gap: 12px;
      `}
    >
      <div
        css={css`
          /* the number badge only earns its place in the multi-column flow diagram;
             in the single-column narrative the steps read fine without it */
          display: none;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: ${radii.pill};
          background: ${colors.red};
          color: ${colors.onInk};
          font-size: ${fontSize.eyebrow};
          font-weight: ${fontWeight.bold};

          @container section (min-width: ${container.section.flow}) {
            display: flex;
          }
        `}
      >
        {n}
      </div>
      <h3
        css={css`
          ${subsectionHeading};
        `}
      >
        {title}
      </h3>
      <p
        css={css`
          font-size: ${fontSize.small};
        `}
      >
        {children}
      </p>
    </div>
  );
}
