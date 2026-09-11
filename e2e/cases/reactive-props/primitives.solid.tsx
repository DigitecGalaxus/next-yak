import { styled } from "@yak/solid";
import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

export const Box = styled.div`
  padding: 4px;
`;

export const Children = styled.div.attrs<{ $show: boolean }>((props) =>
  props.$show ? { children: "ready" } : {},
)`
  padding: 4px;
`;

export const Tint = styled.div.attrs({ $color: "rgb(255, 0, 0)" })`
  color: ${(props) => ({ ...props }).$color};
`;

function Rest(props: JSX.HTMLAttributes<HTMLDivElement> & { unused?: string }) {
  const rest = omit(props, "unused");
  return <div {...rest} />;
}

export const Forwarded = styled(Rest).attrs<{ $label: string }>((props) => ({
  "data-label": props.$label,
}))`
  padding: 4px;
`;
