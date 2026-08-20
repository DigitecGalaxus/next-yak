import { createSignal } from "solid-js";
import { Divider } from "./Divider.tsx";

/**
 * Solid twin of hmr-styled-refresh-boundary (which stays React-only since it
 * pins React Fast Refresh semantics): a stateful component imports a styled
 * component from a styled-only file. Editing that file's CSS must hot-apply
 * without a full page reload. See index.test.ts for the state-preservation
 * contract, which is weaker than React's.
 */
export default function App() {
  const [count, setCount] = createSignal(0);

  return (
    <div>
      <Divider data-testid="divider" />
      <span data-testid="counter">{count()}</span>
      <button data-testid="increment" onClick={() => setCount((c) => c + 1)}>
        +1
      </button>
    </div>
  );
}
