import { useState } from "react";
import { DividerForPage, PAGE_CONFIG } from "./pageUtils.ts";

/**
 * App imports a styled component through a chain of non-boundary modules:
 *   Divider.tsx → barrel.ts (namespace export) → pageUtils.ts (mixed exports)
 *
 * Divider.tsx is a refresh boundary thanks to yak's $RefreshReg$ injection.
 * This module exports getPageConfig (non-component), making it NOT a
 * refresh boundary — so it relies on Divider.tsx accepting the update.
 */
export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      {PAGE_CONFIG.showDivider && <DividerForPage data-testid="divider" />}
      <span data-testid="counter">{count}</span>
      <button data-testid="increment" onClick={() => setCount((c) => c + 1)}>
        +1
      </button>
    </div>
  );
}

// Non-component export → makes this module NOT a refresh boundary
export const getPageConfig = () => PAGE_CONFIG;
