import { styled } from "@yak/solid";

/**
 * A mixed module: a JSX component export next to a styled export. Legend is
 * registered by vite-plugin-solid's own pass; Badge registers too because it
 * is rendered as a JSX tag in its own module (solidjs/solid#3090).
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
