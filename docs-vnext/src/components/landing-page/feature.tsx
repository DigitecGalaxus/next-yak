import { css } from "next-yak";
import type { CSSProperties, ReactNode } from "react";
import { colors, fontSize } from "@/tokens";
import { subsectionHeading } from "@/lib/mixins";

export default function Feature({
  icon,
  title,
  className,
  style,
  children,
}: {
  icon: ReactNode;
  title: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <li
      className={className}
      style={style}
      css={css`
        padding: 28px;
        background: ${colors.beigeLight};
      `}
    >
      {icon}
      <h3
        css={css`
          ${subsectionHeading};
          line-height: 22px;
          margin-top: 18px;
        `}
      >
        {title}
      </h3>
      <p
        css={css`
          font-size: ${fontSize.small};
          line-height: 1.6;
          color: unset;
          margin-top: 12px;
        `}
      >
        {children}
      </p>
    </li>
  );
}
