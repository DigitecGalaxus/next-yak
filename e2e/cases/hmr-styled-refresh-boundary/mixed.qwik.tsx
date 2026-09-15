import { styled } from "@yak/qwik";

/**
 * A mixed module: a JSX component export next to a styled export.
 */
export const Badge = styled.span.attrs({ title: "v1" })`
  color: rgb(255, 0, 0);
`;

export function Legend() {
  return (
    <p>
      <Badge data-testid="in-module-badge">in-module</Badge>
    </p>
  );
}
