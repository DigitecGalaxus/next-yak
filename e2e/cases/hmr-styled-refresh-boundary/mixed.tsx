import { styled } from "next-yak";

/**
 * A mixed module: a JSX component export next to a styled export. Both
 * exports count as components for Fast Refresh (Legend by shape, Badge
 * through styled-export refresh registration), making the module a boundary.
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
