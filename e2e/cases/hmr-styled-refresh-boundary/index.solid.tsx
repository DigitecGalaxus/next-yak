import { createSignal } from "solid-js";
import { DividerForPage, PAGE_CONFIG } from "./pageUtils.ts";
import { Badge, Legend } from "./mixed.tsx";

/**
 * App imports a styled component through a chain of non-boundary modules:
 *   Divider.tsx → barrel.tsx (namespace export) → pageUtils.ts (mixed exports)
 *
 * None of the chain modules define components, so only Divider.tsx itself
 * can accept an edit to it as an HMR boundary — an update accepted here
 * instead re-creates <App /> and resets its signal (see index.test.ts).
 *
 * Legend and the imported Badge serve the mixed-module test in
 * index.test.ts, which edits mixed.tsx.
 */
export default function App() {
  const [count, setCount] = createSignal(0);

  return (
    <div>
      {PAGE_CONFIG.showDivider && <DividerForPage data-testid="divider" />}
      <Legend />
      <Badge data-testid="imported-badge">imported</Badge>
      <span data-testid="counter">{count()}</span>
      <button data-testid="increment" onClick={() => setCount((c) => c + 1)}>
        +1
      </button>
    </div>
  );
}

// Non-component export → makes this module NOT a refresh boundary
export const getPageConfig = () => PAGE_CONFIG;
