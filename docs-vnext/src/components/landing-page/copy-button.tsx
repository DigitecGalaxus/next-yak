"use client";

import { styled } from "next-yak";
import { light, dark, ink } from "@/tokens";
import { focusRing } from "@/lib/mixins";
import { useCopy } from "@/lib/use-copy";
import { CSSProperties } from "react";

/**
 * The red "install" copy button shared by the hero npm terminal and the coverage card.
 * A flat, dark-edged button that flips to a green "COPIED" confirmation.
 * Self-contained — pass the text.
 */
export function CopyButton({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
}) {
  const { copied, copy } = useCopy();
  return (
    <Button
      type="button"
      onClick={() => copy(text)}
      data-copied={copied}
      title={text}
      className={className}
      style={style}
    >
      {copied ? "COPIED" : "COPY"}
    </Button>
  );
}

const Button = styled.button`
  min-width: 72px;
  padding: 5px 10px;
  border-radius: 6px;
  border: 2px solid ${ink.copyEdge};
  font-weight: 700;
  background: light-dark(${light.red}, ${dark.redDeep});
  color: white;
  font-size: 13px;
  cursor: pointer;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      background 0.18s ease,
      color 0.18s ease;
  }

  &:hover {
    background: light-dark(${light.redDeep}, ${dark.red});
  }

  &:focus-visible {
    ${focusRing};
    --focus-ring: ${ink.success};
  }

  &[data-copied="true"] {
    background: ${ink.successDeep};
  }
`;
