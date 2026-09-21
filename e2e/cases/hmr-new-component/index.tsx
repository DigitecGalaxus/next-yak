import { styled } from "next-yak";

const First = styled.div`
  color: red;
`;

export default function App() {
  return (
    <div>
      <First data-testid="first">First</First>
      <button
        data-testid="ready"
        onClick={(event) => {
          event.currentTarget.textContent = "Ready";
        }}
      >
        Start
      </button>
    </div>
  );
}
