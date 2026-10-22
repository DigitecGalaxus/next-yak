import { useCallback, useState, type RefCallback } from "react";

/**
 * The turn (0 to n - 1) a block is on while it crosses a reading band in the upper third
 * of the viewport, or null before the first and after the last turn. The scroll position
 * only picks the turn, so a component can animate each change over a fixed duration.
 * Pass the returned ref to the block: it listens while the block is mounted.
 */
export function useScrollTurn(n: number): [number | null, RefCallback<HTMLElement>] {
  const [turn, setTurn] = useState<number | null>(null);

  const ref = useCallback(
    (element: HTMLElement | null) => {
      if (!element || n === 0) return;

      // scroll events already arrive once per frame, and an unchanged turn skips the re-render
      const update = () => {
        const rect = element.getBoundingClientRect();
        const bandTop = window.innerHeight * BAND_TOP;
        const bandBottom = window.innerHeight * BAND_BOTTOM;
        // 0 when the block's top reaches the band, 1 when its bottom has left it
        const progress = (bandBottom - rect.top) / (rect.height + bandBottom - bandTop);
        const index = Math.floor((progress - TOUR_START) / (TOUR_SPAN / n));
        setTurn(index >= 0 && index < n ? index : null);
      };

      update();
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      return () => {
        window.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
      };
    },
    [n],
  );

  return [turn, ref];
}

/** The reading band, as fractions of the viewport height from the top. */
const BAND_TOP = 0.3;
const BAND_BOTTOM = 0.4;
/** The part of the block's way through the band that the turns share. */
const TOUR_START = 0.08;
const TOUR_SPAN = 0.66;
