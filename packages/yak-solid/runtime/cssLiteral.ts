import type { YakTheme } from "./index.ts";
import type { Accessor } from "solid-js";
import { ClassCollector, CompiledStyleProcessor, StyleObject } from "./publicStyledApi.js";

// Symbol.for, not Symbol(): the package ships two bundles (the public entry
// and the internal one the compiler imports) and both contain this module. a
// styled component created through one must be recognized by the other
export const yakComponentSymbol = Symbol.for("@yak/solid:component");

/**
 * the class names of one render, kept as one space-separated string in the
 * order the style block adds them. add() is the hot path: an append, and a
 * duplicate check only once a second name arrives. has() and delete() exist
 * for runtime processors that take a name back out, such as an atom that
 * reverts a class. a Set would need a split and a join per render for the
 * same string
 */
export class Classes implements ClassCollector {
  value: string;
  /**
   * false once a name came from the author, such as an atom. compiler names
   * are safe to print as they are; serializeElement in styled.ts escapes the
   * class once this is false
   */
  generated = true;
  constructor(initial?: string) {
    this.value = initial || "";
  }
  add(name: string, generated = true) {
    if (!generated) this.generated = false;
    if (!this.value) {
      this.value = name;
    } else if (!this.has(name)) {
      this.value += " " + name;
    }
  }
  has(name: string) {
    return (" " + this.value + " ").includes(" " + name + " ");
  }
  delete(name: string) {
    if (this.has(name)) {
      this.value = this.value
        .split(" ")
        .filter((existing) => existing !== name)
        .join(" ");
    }
  }
}

export type ComponentStyles<TProps> = (props: TProps) => {
  class: string;
  style?: {
    [key: string]: string;
  };
};

export type CSSInterpolation<TProps> =
  | string
  | number
  | undefined
  | null
  | false
  | ComponentStyles<TProps>
  | {
      // type only identifier to allow targeting components
      // e.g. styled.svg`${Button}:hover & { fill: red; }`
      [yakComponentSymbol]: any;
    }
  | ((props: TProps) => CSSInterpolation<TProps>);

type CSSStyles<TProps = {}> = {
  style: { [key: string]: string | ((props: TProps) => string) };
};

export type CSSFunction = <TProps>(
  styles: TemplateStringsArray,
  ...values: CSSInterpolation<NoInfer<TProps> & { theme: Accessor<YakTheme> }>[]
) => ComponentStyles<TProps>;

export type NestedRuntimeStyleProcessor = (
  props: unknown,
  classes: ClassCollector,
  style: StyleObject,
) =>
  | {
      class?: string;
      style?: StyleObject;
    }
  | void
  | false
  | null
  | string
  | number
  | NestedRuntimeStyleProcessor;

/**
 * the runtime behind css``. the compiler rewrites every css`` and styled``
 * call, so what arrives here is never the template the author wrote but its
 * compiled form: class names, callbacks and css-variable maps (examples in
 * the loop below). the public typings describe the call before compilation,
 * which is why this function is internal: mocks/cssLiteral.ts exports the
 * css the author sees, cast to the public type.
 *
 * it returns one processor, (props, classes, style) => void, that runs every
 * compiled piece: class names go into the collector, css values into the
 * style object
 */
export function css<TProps>(...args: Array<any>): CompiledStyleProcessor<TProps> {
  let staticClass: string | undefined;
  const dynamicCssFunctions: NestedRuntimeStyleProcessor[] = [];
  for (const arg of args as Array<string | NestedRuntimeStyleProcessor | CSSStyles<any>>) {
    // static css became a css-module class name at build time:
    //   css`color: red;`  ->  css("yak31e4")
    if (typeof arg === "string") {
      staticClass = arg;
    }
    // conditional css stays a callback that returns another compiled css():
    //   css`${props => props.active && css`color: red;`}`
    //   ->  css(props => props.active && css("yak31e4"))
    else if (typeof arg === "function") {
      dynamicCssFunctions.push(arg);
    }
    // a css value became a variable the callback fills at render time:
    //   css`transform: translate(${props => props.x});`
    //   ->  css("yak31e4", { style: { "--yakVarX": props => props.x } })
    else if (typeof arg === "object" && "style" in arg) {
      dynamicCssFunctions.push((props, _, style) => {
        for (const key in arg.style) {
          const value = arg.style[key];
          if (typeof value === "function") {
            style[key as keyof StyleObject] = String(
              // a callback may return another callback before it yields the
              // value, such as a theme-dependent one:
              //   const color = (props) => props.theme().mode === "dark" ? "black" : "white";
              //   css`border-color: ${color};`
              recursivePropExecution(props, value),
            ) as never;
          } else {
            style[key as keyof StyleObject] = String(value) as never;
          }
        }
      });
    }
  }

  // no dynamic parts, the common case: $dynamic false lets styled() skip the
  // theme lookup and the style object for the component
  if (dynamicCssFunctions.length === 0) {
    return Object.assign(
      (_: unknown, classes: ClassCollector) => {
        if (staticClass) {
          classes.add(staticClass);
        }
      },
      { $dynamic: false as const },
    ) satisfies CompiledStyleProcessor<TProps>;
  }

  return Object.assign(
    (props: TProps, classes: ClassCollector, allStyles: StyleObject) => {
      if (staticClass) {
        classes.add(staticClass);
      }
      for (let i = 0; i < dynamicCssFunctions.length; i++) {
        runProcessor(props, dynamicCssFunctions[i], classes, allStyles);
      }
    },
    { $dynamic: true as const },
  ) satisfies CompiledStyleProcessor<TProps>;
}

/** run one processor and fold what it returns into the collector and the style object */
const runProcessor = (
  props: unknown,
  fn: NestedRuntimeStyleProcessor,
  classes: ClassCollector,
  style: StyleObject,
) => {
  let result = fn(props, classes, style);
  while (result) {
    if (typeof result === "function") {
      result = result(props, classes, style);
      continue;
    } else if (typeof result === "object") {
      const resultClass = "class" in result ? result.class : undefined;
      if (resultClass) {
        classes.add(resultClass);
      }
      if ("style" in result && result.style) {
        for (const key in result.style) {
          // both objects use StyleObject; typescript loses the key/value relation in this loop
          style[key as keyof StyleObject] = result.style[key as keyof StyleObject] as any;
        }
      }
    }
    break;
  }
};

const recursivePropExecution = (props: unknown, fn: (props: unknown) => any): string | number => {
  const result = fn(props);
  if (typeof result === "function") {
    return recursivePropExecution(props, result);
  }
  // typeof guards first: the `process.env` lookup is a real per-call cost
  // for unbundled Node consumers, so it must only run on the invalid path
  if (typeof result !== "string" && typeof result !== "number" && !(result instanceof String)) {
    if (process.env.NODE_ENV === "development") {
      throw new Error(
        `Dynamic CSS functions must return a string or number but returned ${JSON.stringify(
          result,
        )}\n\nDynamic CSS function: ${fn.toString()}\n`,
      );
    }
  }
  return result;
};
