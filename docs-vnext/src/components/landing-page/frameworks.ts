import { QwikIcon, ReactIcon, SolidIcon } from "./framework-icons";

// The frameworks yak ships first-class adapters for. The hero editor cycles its install
// command across these; the coverage card maps each to its icon + package. Single source
// of truth so the two never drift.
export const frameworks = [
  { id: "react", label: "React", pkg: "@yak/react", Icon: ReactIcon },
  { id: "solid", label: "Solid", pkg: "@yak/solid", Icon: SolidIcon },
  { id: "qwik", label: "Qwik", pkg: "@yak/qwik", Icon: QwikIcon },
] as const;
