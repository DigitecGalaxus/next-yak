import { styled } from "@yak/qwik";
import type { PropsOf } from "@qwik.dev/core";

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

function Rest(props: PropsOf<"div"> & { unused?: string }) {
  const { unused, ...rest } = props;
  return <div {...rest} />;
}

export const Forwarded = styled(Rest).attrs<{ $label: string }>((props) => ({
  "data-label": props.$label,
}))`
  padding: 4px;
`;
