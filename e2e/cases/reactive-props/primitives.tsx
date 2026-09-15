import { styled } from "next-yak";
import type { HTMLAttributes } from "react";

export const Box = styled.div`
  padding: 4px;
`;

export const Children = styled.div.attrs<{ $show: boolean }>((props) =>
  props.$show ? { children: "ready" } : {},
)`
  padding: 4px;
`;

export const Tint = styled.div.attrs<{ $color?: string }>({ $color: "rgb(255, 0, 0)" })<{
  $color?: string;
}>`
  color: ${(props) => ({ ...props }).$color};
`;

function Rest(props: HTMLAttributes<HTMLDivElement> & { unused?: string }) {
  const { unused, ...rest } = props;
  return <div {...rest} />;
}

export const Forwarded = styled(Rest).attrs<{ $label: string }>(
  (props) => ({ "data-label": props.$label }) as HTMLAttributes<HTMLDivElement>,
)`
  padding: 4px;
`;
