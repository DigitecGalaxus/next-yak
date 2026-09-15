import { component$, useSignal } from "@qwik.dev/core";
import { Box, Children, Forwarded, Tint } from "./primitives";

export default component$(() => {
  const active = useSignal(false);
  const extra = active.value ? { "data-label": "ready" } : {};

  return (
    <div>
      <button data-testid="toggle" onClick$={() => (active.value = !active.value)}>
        {active.value ? "on" : "off"}
      </button>
      <Box data-testid="spread" {...extra} />
      <Children data-testid="children" $show={active.value} />
      <Tint data-testid="attrs">attrs</Tint>
      <Forwarded data-testid="forwarded" $label={active.value ? "second" : "first"} />
      <section data-testid="static">
        <Box>
          <Box>{"<b>&text"}</Box>
        </Box>
      </section>
    </div>
  );
});
