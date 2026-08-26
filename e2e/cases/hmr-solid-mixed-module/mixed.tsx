import { styled } from "@yak/solid";

/**
 * A mixed module: Legend (JSX component) makes it a solid-refresh boundary
 * through vite-plugin-solid's own pass; Badge is a styled export with no
 * refresh registration of its own.
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
