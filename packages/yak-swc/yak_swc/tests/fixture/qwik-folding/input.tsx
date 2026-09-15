// Folding for @yak/qwik emits Qwik's `class` attribute (React runtimes get
// `className`). A Qwik component's render function re-runs like React's, so
// every fold shape applies, the element-wrap included: it re-evaluates with
// the parent instead of binding one attribute to a signal.
import { styled, css } from "@yak/qwik";

const someClass = () => "user";
const maybe = () => true;

export const Button = styled.button`
  color: red;
`;

export const Static = () => (
  <section>
    {/* folds into <button class="..."> */}
    <Button type="button">click</Button>
    {/* a user class string merges at compile time */}
    <Button class="user">merged</Button>
    {/* a user class expression merges through the runtime helper */}
    <Button class={someClass()}>runtime merged</Button>
  </section>
);

// a styled(Parent) chain of static components collapses to the element
export const Base = styled.span`
  color: red;
`;
export const Extended = styled(Base)`
  padding: 4px;
`;
export const Chain = () => <Extended>hey</Extended>;

// the class-toggling condition folds into the class attribute, where the
// Solid compiler keeps it reactive
const Box = styled.div<{ $active?: boolean }>`
  padding: 4px;
  ${({ $active }) =>
    $active &&
    css`
      color: blue;
    `}
`;
export const Dynamic = (props: { active: () => boolean }) => <Box $active={props.active()} />;

// a bound non-$ prop takes the element-wrap shape, as on React
const Row = styled.div<{ disabled?: boolean }>`
  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
    `}
`;
export const Wrapped = () => <Row disabled={maybe()} />;

// a namespaced attribute such as q:slot keeps the runtime component for now
// (the fold does not analyse namespaced names; a follow-up can pass them through)
export const Slotted = () => <Button q:slot="header">slot</Button>;

// a keyed usage in a list keeps its key on the folded element
const ids = ["a", "b"];
export const Keyed = () => (
  <ul>
    {ids.map((id) => (
      <Button key={id}>{id}</Button>
    ))}
  </ul>
);

// a static css prop folds into a plain class attribute
export const CssProp = () => (
  <p
    css={css`
      color: green;
    `}
  />
);

// an existing class attribute keeps the runtime merge
export const CssPropMerge = () => (
  <p
    class="user"
    css={css`
      color: green;
    `}
  />
);
