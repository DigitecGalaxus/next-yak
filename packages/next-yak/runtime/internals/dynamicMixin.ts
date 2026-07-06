import { css } from "../cssLiteral.js";
import type { RuntimeStyleProcessor } from "../publicStyledApi.js";

export const yakDynamicMixinSymbol = Symbol("yakDynamicMixin");

/**
 * Scope handle passed to a dynamic mixin factory.
 * Maps producer-assigned branch/slot ids to usage-site scoped class names.
 *
 * `b(0)` -> `<prefix>-b0` (conditional branch class)
 * `b.sub(0)` -> `<prefix>-s0` (derived prefix for a nested cross-file mixin)
 */
export type MixinScopeHandle = {
  (branchId: number): string;
  sub: (slotId: number) => string;
};

/**
 * The compiled representation of an exported dynamic mixin.
 * The factory receives a scope handle and returns the arguments that
 * would be passed to `css()` for a same-file usage of the mixin —
 * toggle functions and css variable objects, with class names created
 * through the handle instead of being baked in.
 */
export type DynamicMixin = {
  [yakDynamicMixinSymbol]: (b: MixinScopeHandle) => unknown[];
};

const noOp = () => {};

/**
 * dynamicMixin() runtime factory for exported dynamic mixins
 *
 * /!\ next-yak injects this call during compilation - it is not part of the public API
 *
 * e.g.:
 * ```tsx
 * export const highlight = css`
 *   color: black;
 *   ${({ $active }) => $active && css`color: red;`}
 * `;
 * ```
 * compiled ->
 * ```tsx
 * export const highlight = __yak_mixin((b) => [
 *   ({ $active }) => $active && css(b(0))
 * ]);
 * ```
 * The static part (`color: black;`) has no runtime representation - it is
 * spliced into the consumer's CSS at build time by the cross-file resolver,
 * which derives the same `<prefix>-b0` class names from the mixin's
 * exported css payload.
 */
export function dynamicMixin(factory: (b: MixinScopeHandle) => unknown[]): DynamicMixin {
  return { [yakDynamicMixinSymbol]: factory };
}

/**
 * useDynamicMixin() instantiates an imported mixin for one usage site
 *
 * /!\ next-yak injects this call during compilation - it is not part of the public API
 *
 * e.g.:
 * ```tsx
 * import { highlight } from "./styles";
 * const Button = styled.button`
 *   ${highlight};
 * `;
 * ```
 * compiled ->
 * ```tsx
 * const Button = __yak.__yak_button("Button_x", __yak_use(highlight, "Button__u0_x"));
 * ```
 *
 * Static mixins compile to a plain `css()` value (or resolve to constants),
 * so anything without the dynamic mixin marker becomes a no-op - their css
 * is inlined at build time and needs no runtime. The call itself still
 * references the imported module, which intentionally keeps the producer
 * (and e.g. its @keyframes definitions) from being tree-shaken away.
 */
export function useDynamicMixin<TProps>(
  mixin: unknown,
  prefix: string,
): RuntimeStyleProcessor<TProps> {
  const factory =
    typeof mixin === "object" && mixin !== null && yakDynamicMixinSymbol in mixin
      ? (mixin as DynamicMixin)[yakDynamicMixinSymbol]
      : undefined;
  if (!factory) {
    return noOp;
  }
  const scopeHandle = Object.assign((branchId: number) => `${prefix}-b${branchId}`, {
    sub: (slotId: number) => `${prefix}-s${slotId}`,
  });
  // css() composes the factory result (toggle functions and css variable
  // objects) into a single RuntimeStyleProcessor - the same shape a
  // same-file dynamic mixin compiles to
  return (css as (...args: unknown[]) => RuntimeStyleProcessor<TProps>)(...factory(scopeHandle));
}
