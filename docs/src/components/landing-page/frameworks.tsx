import { QwikIcon, ReactIcon, SolidIcon } from "./framework-icons";

// `params`/`read` render the `$primary` prop access: Solid reads props off the object to stay reactive.
export const frameworks = [
  { id: "react", pkg: "@yak/react", Icon: ReactIcon, params: "({ $primary })", read: "$primary" },
  { id: "solid", pkg: "@yak/solid", Icon: SolidIcon, params: "(props)", read: "props.$primary" },
  { id: "qwik", pkg: "@yak/qwik", Icon: QwikIcon, params: "({ $primary })", read: "$primary" },
] as const;

export type Framework = (typeof frameworks)[number];

export const FRAMEWORK_TABS = frameworks.map((f) => ({
  value: f.id,
  node: (
    <>
      <f.Icon mono />
      {f.id}
    </>
  ),
}));
