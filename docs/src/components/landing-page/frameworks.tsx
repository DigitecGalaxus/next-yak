import { QwikIcon, ReactIcon, SolidIcon } from "./framework-icons";

// `params`/`read` render the `$primary` prop access: Solid reads props off the object to stay reactive.
// `soon` marks a framework whose package is not published yet: its tab can't be selected.
export const frameworks = [
  {
    id: "react",
    pkg: "@yak/react",
    Icon: ReactIcon,
    params: "({ $primary })",
    read: "$primary",
    soon: false,
  },
  {
    id: "solid",
    pkg: "@yak/solid",
    Icon: SolidIcon,
    params: "(props)",
    read: "props.$primary",
    soon: false,
  },
  {
    id: "qwik",
    pkg: "@yak/qwik",
    Icon: QwikIcon,
    params: "({ $primary })",
    read: "$primary",
    soon: true,
  },
] as const;

export type Framework = (typeof frameworks)[number];

export const FRAMEWORK_TABS = frameworks.map((f) => ({
  value: f.id,
  disabled: f.soon,
  node: (
    <>
      <f.Icon mono />
      {f.id}
    </>
  ),
}));

// Same tabs, with a "(soon)" note on the unpublished frameworks
export const FRAMEWORK_TABS_WITH_SOON = frameworks.map((f) => ({
  value: f.id,
  disabled: f.soon,
  node: (
    <>
      <f.Icon mono />
      {f.id}
      {f.soon ? " (soon)" : null}
    </>
  ),
}));
