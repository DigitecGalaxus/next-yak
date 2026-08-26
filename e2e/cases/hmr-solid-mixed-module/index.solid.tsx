import { createSignal } from "solid-js";
import { Badge, Legend } from "./mixed.tsx";

/**
 * Pins how a mixed module (styled export + JSX component export) behaves
 * under solid HMR: the module self-accepts via vite-plugin-solid, so this
 * importing component keeps its state — but every rendered usage of the
 * styled export goes stale on JS edits, even inside the mixed module
 * itself. See index.test.ts for the full contract.
 */
export default function App() {
  const [count, setCount] = createSignal(0);

  return (
    <div>
      <Legend />
      <Badge data-testid="imported-badge">imported</Badge>
      <span data-testid="counter">{count()}</span>
      <button data-testid="increment" onClick={() => setCount((c) => c + 1)}>
        +1
      </button>
    </div>
  );
}
