import { useState } from "react";
import { DividerForPage, PAGE_CONFIG } from "./pageUtils.ts";

/**
 * App imports a styled component through a chain of non-boundary modules:
 *   Divider.tsx (.name="yak") → barrel.ts (namespace export) → pageUtils.ts (mixed exports)
 *
 * This function also exports getPageConfig (non-component), making this
 * module NOT a refresh boundary either. The HMR update propagates all the
 * way to the entry point → abort → full reload.
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
