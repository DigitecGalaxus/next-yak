import { component$ } from "@qwik.dev/core";
import { styled } from "@yak/qwik";

const First = styled.div`
  color: red;
`;

export default component$(() => {
  return (
    <div>
      <First data-testid="first">First</First>
      <button
        data-testid="ready"
        onClick$={(_, button) => {
          button.textContent = "Ready";
        }}
      >
        Start
      </button>
    </div>
  );
});
