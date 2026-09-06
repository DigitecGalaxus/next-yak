import { css } from "next-yak";
import { ink } from "@/tokens";

export function Dot({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5.5" cy="5.5" r="5.5" fill={color} />
    </svg>
  );
}

/** The three window dots in a dark editor's title bar (hero editor, feature showcase). */
export function EditorDots() {
  return (
    <div
      css={css`
        display: flex;
        flex-shrink: 0;
        align-items: center;
        gap: 7px;
      `}
    >
      <Dot color={ink.dotRed} />
      <Dot color={ink.dotYellow} />
      <Dot color={ink.dotGreen} />
    </div>
  );
}
