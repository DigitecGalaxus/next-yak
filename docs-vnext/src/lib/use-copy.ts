"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Copy-to-clipboard with a transient "copied" confirmation, shared by the docs code
 * block, the hero npm terminal, and the coverage install command.
 *
 * Returns the current `copied` flag and a `copy(text)` action; the flag flips back
 * after `resetMs`. Silently no-ops if the clipboard API is unavailable (e.g. an
 * insecure context), leaving the UI as-is.
 */
export function useCopy(resetMs = 1500) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Don't fire setCopied after the consumer unmounts.
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        return;
      }
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), resetMs);
    },
    [resetMs],
  );

  return { copied, copy };
}
