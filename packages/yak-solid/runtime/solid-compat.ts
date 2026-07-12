/**
 * The single boundary between the yak runtime and version-specific Solid APIs.
 *
 * @yak/solid officially targets Solid 2.x. Every import of `solid-js` /
 * `@solidjs/web` and every API that was renamed between Solid 1 and Solid 2
 * (mergeProps -> merge, splitProps -> omit, Provider shape) lives in this file,
 * so supporting Solid 1 later only requires an alternative implementation of
 * this module - not a runtime redesign.
 */
import { createContext, createMemo, useContext, type Context } from "solid-js";
import { createComponent, Dynamic, type JSX } from "@solidjs/web";

export { createComponent, createContext, createMemo, useContext };
export type { Context, JSX };

/**
 * Renders `props.component` (a tag name or component) with the remaining
 * props. Loosely typed on purpose: the runtime passes lazily-merged Proxy
 * props that no concrete component type can describe.
 */
export const renderDynamic = (props: Record<PropertyKey, unknown>): JSX.Element =>
  createComponent(Dynamic as (props: Record<PropertyKey, unknown>) => JSX.Element, props);

/**
 * Getter-preserving props merge (last source wins), a minimal stand-in for
 * Solid's `mergeProps`/`merge`. Hand-rolled because the helper was renamed
 * between Solid 1 and 2 and the runtime only needs this subset:
 * property reads stay lazy so signal/props reads are tracked at the
 * position of the read (e.g. inside a memo), never at merge time.
 *
 * A source can be a function returning an object - it is resolved on every
 * property access which keeps derived sources (like attrs results) reactive.
 */
type PropsSource = Record<PropertyKey, unknown> | (() => Record<PropertyKey, unknown> | undefined);

export const mergeSolidProps = (...sources: PropsSource[]): Record<PropertyKey, unknown> => {
  const resolve = (source: PropsSource): Record<PropertyKey, unknown> =>
    (typeof source === "function" ? source() : source) ?? {};
  const lookup = (key: PropertyKey): Record<PropertyKey, unknown> | undefined => {
    for (let i = sources.length - 1; i >= 0; i--) {
      const resolved = resolve(sources[i]);
      if (key in resolved) {
        return resolved;
      }
    }
    return undefined;
  };
  return new Proxy(Object.create(null) as Record<PropertyKey, unknown>, {
    get(_, key) {
      return lookup(key)?.[key];
    },
    has(_, key) {
      return lookup(key) !== undefined;
    },
    ownKeys() {
      const keys = new Set<string | symbol>();
      for (const source of sources) {
        for (const key of Reflect.ownKeys(resolve(source))) {
          keys.add(key);
        }
      }
      return Array.from(keys);
    },
    getOwnPropertyDescriptor(_, key) {
      const source = lookup(key);
      if (!source) {
        return undefined;
      }
      return {
        enumerable: true,
        configurable: true,
        get: () => lookup(key)?.[key],
      };
    },
  });
};

/**
 * Renders a context provider without JSX.
 *
 * Solid 2's `createContext` returns the provider component itself while
 * Solid 1 exposes it as `context.Provider` - feature-detect so a future
 * Solid 1 build of this file stays a one-liner.
 */
export const renderContextProvider = <T>(
  context: Context<T>,
  value: T,
  children: () => JSX.Element,
): JSX.Element => {
  const provider = (
    typeof context === "function" ? context : (context as { Provider: unknown }).Provider
  ) as (props: { value: T; children: JSX.Element }) => JSX.Element;
  return createComponent(provider, {
    value,
    get children() {
      return children();
    },
  });
};
