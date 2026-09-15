import { frameworks } from "./frameworks";

export const FRAMEWORK_TABS = frameworks.map((f) => ({
  value: f.id,
  node: (
    <>
      <f.Icon mono />
      {f.id}
    </>
  ),
}));
