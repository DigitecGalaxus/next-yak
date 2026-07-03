"use client";

import { styled } from "next-yak";
import { light, dark, ink } from "@/tokens";
import { focusRing } from "@/lib/mixins";
import { useCopy } from "@/lib/use-copy";
import { CSSProperties } from "react";

/**
 * The red "install" copy button shared by the hero npm terminal and the coverage card.
 * A brutalist offset-shadow button (the same haptic as the CTA buttons) that flips to a
 * green "COPIED" confirmation while keeping its dark edge. Self-contained — pass the text.
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
  box-shadow: 2px 2px 0 0 ${ink.copyEdge};

  @media (prefers-reduced-motion: no-preference) {
    transition:
      transform 0.08s ease,
      box-shadow 0.08s ease,
      background 0.18s ease,
      color 0.18s ease;
  }

  &:hover {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0 0 ${ink.copyEdge};
  }

  &:active {
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 0 ${ink.copyEdge};
  }

  &:focus-visible {
    ${focusRing};
    --focus-ring: ${ink.success};
  }

  &[data-copied="true"] {
    background: ${ink.successDeep};
  }
`;
