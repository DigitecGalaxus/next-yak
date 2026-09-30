import React from "react";
import { styled as StyledFactory } from "../styled.js";

export const styled = new Proxy(StyledFactory, {
  get(target, TagName: keyof React.JSX.IntrinsicElements) {
    return target(TagName);
  },
}) as typeof StyledFactory;
