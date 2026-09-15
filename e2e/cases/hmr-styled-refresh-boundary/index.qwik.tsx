import { component$, useSignal } from "@qwik.dev/core";
import { DividerForPage, PAGE_CONFIG } from "./pageUtils.ts";
import { Badge, Legend } from "./mixed.tsx";

/**
 * App imports a styled component through a chain of non-boundary modules:
 *   Divider.tsx → barrel.tsx (namespace export) → pageUtils.ts (mixed exports)
 *
 * The counter below tells whether an edit to Divider.tsx kept the component
 * state (qwik's HMR re-renders the component$ in place) or re-created <App />.
 *
 * Legend and the imported Badge serve the mixed-module test in
 * index.test.ts, which edits mixed.tsx.
 */
export default component$(() => {
  const count = useSignal(0);

  return (
    <div>
      {PAGE_CONFIG.showDivider && <DividerForPage data-testid="divider" />}
      <Legend />
      <Badge data-testid="imported-badge">imported</Badge>
      <span data-testid="counter">{count.value}</span>
      <button data-testid="increment" onClick$={() => count.value++}>
        +1
      </button>
    </div>
  );
});

// Non-component export → makes this module NOT a refresh boundary
export const getPageConfig = () => PAGE_CONFIG;
