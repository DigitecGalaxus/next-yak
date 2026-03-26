import { useState } from "react";
import { Section } from "./Section.tsx";

/**
 * App imports a styled-only component from a separate file.
 * The counter state detects whether Fast Refresh preserved state
 * or a full reload occurred (which resets the counter to 0).
 */
export default function App() {
  const [count, setCount] = useState(0);

  return (
    <Section data-testid="section">
      <span data-testid="counter">{count}</span>
      <button data-testid="increment" onClick={() => setCount((c) => c + 1)}>
        +1
      </button>
    </Section>
  );
}
