import type { JSX } from "@solidjs/web";
import { styled as StyledFactory } from "../styled.js";

export const styled = new Proxy(StyledFactory, {
  get(target, TagName: keyof JSX.IntrinsicElements) {
    return target(TagName);
  },
}) as typeof StyledFactory;
