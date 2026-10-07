import type { HtmlTags } from "../publicStyledApi.js";
import { styled as StyledFactory } from "../styled.js";

export const styled = /* @__PURE__ */ new Proxy(StyledFactory, {
  get(target, key) {
    // only a tag name becomes a factory. symbols, the function's own
    // properties and `then` pass through, so a promise that resolves the
    // factory does not take it for a thenable
    if (typeof key !== "string" || key === "then" || key in target) return Reflect.get(target, key);
    return target(key as HtmlTags);
  },
}) as typeof StyledFactory;
