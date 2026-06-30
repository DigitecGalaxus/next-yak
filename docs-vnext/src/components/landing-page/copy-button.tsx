"use client";

import { styled } from "next-yak";
import { colors } from "@/tokens";
import { focusRing } from "@/lib/mixins";
import { useCopy } from "@/lib/use-copy";

/**
 * The red "install" copy button shared by the hero npm terminal and the coverage card.
 * A brutalist offset-shadow button (the same haptic as the CTA buttons) that flips to a
 * cyan "COPIED" confirmation. Self-contained — pass the text to copy.
 */
export function CopyButton({ text, className }: { text: string; className?: string }) {
  const { copied, copy } = useCopy();
  return (
    <Button
      type="button"
      onClick={() => copy(text)}
      data-copied={copied}
      title={text}
      className={className}
    >
      {copied ? "COPIED" : "COPY"}
    </Button>
  );
}

const Button = styled.button`
  /* the hard offset shadow that collapses as the button presses down — the same
     "brutalist" haptic the CTA buttons use, scaled to this small button */
  --bevel: #99291a;
  min-width: 58px;
  padding: 5px 10px;
  border-radius: 6px;
  border: none;
  font-weight: 700;
  background: ${colors.red};
  color: white;
  font-size: 10px;
  cursor: pointer;
  box-shadow: 2px 2px 0 0 var(--bevel);

  @media (prefers-reduced-motion: no-preference) {
    transition:
      transform 0.08s ease,
      box-shadow 0.08s ease,
      background 0.18s ease,
      color 0.18s ease;
  }

  &:hover {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0 0 var(--bevel);
  }

  &:active {
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 0 var(--bevel);
  }

  &:focus-visible {
    ${focusRing};
    --focus-ring: ${colors.cyan};
  }

  &[data-copied="true"] {
    --bevel: #0b8e96;
    background: ${colors.cyan};
    color: ${colors.ink};
  }
`;
