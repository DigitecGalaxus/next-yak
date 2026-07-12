// Folding for @yak/solid emits Solid's `class` attribute (React runtimes get
// `className`). Shapes which keep every evaluation inside the class attribute
// expression stay reactive in Solid; the element-wrap shape would freeze its
// bound values (a Solid component runs once), so those usages keep the runtime
// component.
import { styled, css } from "@yak/solid";

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

// a bound non-$ prop needs the element-wrap shape, which would freeze the
// value in Solid - the usage keeps the runtime component
const Row = styled.div<{ disabled?: boolean }>`
  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
    `}
`;
export const Wrapped = () => <Row disabled={maybe()} />;

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
