import type { YakTheme } from "./index.ts";
import type { Accessor } from "solid-js";
import { ClassCollector, CompiledStyleProcessor, StyleObject } from "./publicStyledApi.js";

export const yakComponentSymbol = Symbol("yak");

/** Collect class names in order, with membership and removal for atoms. */
export class Classes implements ClassCollector {
  value: string;
  constructor(initial?: string) {
    this.value = initial || "";
  }
  add(name: string) {
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

/** Combine compiled classes, conditional styles and CSS variables. */
export function css<TProps>(...args: Array<any>): CompiledStyleProcessor<TProps> {
  // The compiler supplies class names, style callbacks and CSS-variable maps.
  let staticClass: string | undefined;
  const dynamicCssFunctions: NestedRuntimeStyleProcessor[] = [];
  for (const arg of args as Array<string | NestedRuntimeStyleProcessor | CSSStyles<any>>) {
    // Static CSS becomes a CSS-module class name.
    if (typeof arg === "string") {
      staticClass = arg;
    }
    // Conditional CSS stays a callback, such as props => props.active && css("yak31e4").
    else if (typeof arg === "function") {
      dynamicCssFunctions.push(arg);
    }
    // Dynamic CSS values become variables, such as { style: { "--yakX": props => props.x } }.
    else if (typeof arg === "object" && "style" in arg) {
      dynamicCssFunctions.push((props, _, style) => {
        for (const key in arg.style) {
          const value = arg.style[key];
          if (typeof value === "function") {
            style[key as keyof StyleObject] = String(
              // A callback can return another callback before it yields the CSS value.
              recursivePropExecution(props, value),
            ) as never;
          } else {
            style[key as keyof StyleObject] = String(value) as never;
          }
        }
      });
    }
  }

  // Static processors need neither a theme lookup nor a style object.
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
        unwrapProps(props, dynamicCssFunctions[i], classes, allStyles);
      }
    },
    { $dynamic: true as const },
  ) satisfies CompiledStyleProcessor<TProps>;
}

// Resolve callbacks and merge any returned classes and styles.
const unwrapProps = (
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
          // Both objects use StyleObject; TypeScript loses the key/value relation in this loop.
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
