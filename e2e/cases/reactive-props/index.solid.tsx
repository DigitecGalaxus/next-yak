import { createSignal } from "solid-js";
import { Box, Children, Forwarded, Tint } from "./primitives";

export default function App() {
  const [active, setActive] = createSignal(false);
  const extra = () => (active() ? { "data-label": "ready" } : {});

  return (
    <div>
      <button data-testid="toggle" onClick={() => setActive((value) => !value)}>
        {active() ? "on" : "off"}
      </button>
      <Box data-testid="spread" {...extra()} />
      <Children data-testid="children" $show={active()} />
      <Tint data-testid="attrs">attrs</Tint>
      <Forwarded data-testid="forwarded" $label={active() ? "second" : "first"} />
      <section data-testid="static">
        <Box>
          <Box>{"<b>&text"}</Box>
        </Box>
      </section>
    </div>
  );
}
