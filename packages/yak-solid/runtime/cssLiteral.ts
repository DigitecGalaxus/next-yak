import type { YakTheme } from "./index.ts";
import { ClassNameCollector, RuntimeStyleProcessor, StyleObject } from "./publicStyledApi.js";

export const yakComponentSymbol = Symbol("yak");

/**
 * String-backed ClassNameCollector used by the render path.
 *
 * Replaces the previous `new Set(className.split(" "))` →
 * `Array.from(set).join(" ")` round-trip, which dominated render cost.
 * The hot path (`add`) is a plain string append with a containment check;
 * `has`/`delete` keep the Set-like contract for advanced runtime functions
 * (e.g. atoms removing classes) on the rare path.
 */
export class ClassNames implements ClassNameCollector {
  value: string;
  constructor(initial?: string) {
    this.value = initial || "";
  }
  add(className: string) {
    if (!this.value) {
      this.value = className;
    } else if (!this.has(className)) {
      this.value += " " + className;
    }
  }
  has(className: string) {
    return (" " + this.value + " ").includes(" " + className + " ");
  }
  delete(className: string) {
    if (this.has(className)) {
      this.value = this.value
        .split(" ")
        .filter((existing) => existing !== className)
        .join(" ");
    }
  }
}

export type ComponentStyles<TProps> = (props: TProps) => {
  className: string;
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

type CSSFunction = <TProps = {}>(
  styles: TemplateStringsArray,
  ...values: CSSInterpolation<TProps & { theme: YakTheme }>[]
) => ComponentStyles<TProps>;

export type NestedRuntimeStyleProcessor = (
  props: unknown,
  classNames: ClassNameCollector,
  style: StyleObject,
) =>
  | {
      class?: string;
      className?: string;
      style?: StyleObject;
    }
  | void
  | NestedRuntimeStyleProcessor;

/**
 * css() runtime factory of css``
 *
 * /!\ @yak/solid transpiles css`` and styled``
 *
 * This changes the typings of the css`` and styled`` functions.
 * During development the user of @yak/solid wants to work with the
 * typings BEFORE compilation.
 *
 * Therefore this is only an internal function only and it must be cast to any
 * before exported to the user.
 *
 * The internal functioning of css`` is to return a single callback function that runs all functions
 * (or creates new ones if needed) that are passed as arguments. These functions receive the props, classNames, and style object as arguments
 * and operate directly on the classNames and style objects.
 */
export function css<TProps>(
  styles: TemplateStringsArray,
  ...values: CSSInterpolation<NoInfer<TProps> & { theme: YakTheme }>[]
): ComponentStyles<TProps>;
export function css<TProps>(...args: Array<any>): RuntimeStyleProcessor<TProps> {
  // Normally this  could be an array of strings passed, but as we transpile the usage of css`` ourselves, we control the arguments
  // and ensure that only the first argument is a string (class name of the non-dynamic styles)
  let className: string | undefined;
  const dynamicCssFunctions: NestedRuntimeStyleProcessor[] = [];
  for (const arg of args as Array<string | CSSFunction | CSSStyles<any>>) {
    // A CSS-module class name which got auto generated during build from static css
    // e.g. css`color: red;`
    // compiled -> css("yak31e4")
    if (typeof arg === "string") {
      className = arg;
    }
    // Dynamic CSS e.g.
    // css`${props => props.active && css`color: red;`}`
    // compiled -> css((props: { active: boolean }) => props.active && css("yak31e4"))
    else if (typeof arg === "function") {
      dynamicCssFunctions.push(arg as unknown as NestedRuntimeStyleProcessor);
    }
    // Dynamic CSS with css variables e.g.
    // css`transform: translate(${props => props.x}, ${props => props.y});`
    // compiled -> css("yak31e4", { style: { "--yakVarX": props => props.x }, "--yakVarY": props => props.y }})
    else if (typeof arg === "object" && "style" in arg) {
      dynamicCssFunctions.push((props, _, style) => {
        for (const key in arg.style) {
          const value = arg.style[key];
          if (typeof value === "function") {
            style[key as keyof StyleObject] = String(
              // The value for a css value can be a theme dependent function e.g.:
              // const borderColor = (props: { theme: { mode: "dark" | "light" } }) => props.theme === "dark" ? "black" : "white";
              // css`border-color: ${borderColor};`
              // Therefore the value has to be extracted recursively
              recursivePropExecution(props, value),
            ) as never;
          } else {
            style[key as keyof StyleObject] = String(value) as never;
          }
        }
      });
    }
  }

  // Non Dynamic CSS
  // This is just an optimization for the common case where there are no dynamic css functions
  // `$dynamic: false` lets the styled runtime skip theme lookup and
  // style-object allocation entirely for static components
  if (dynamicCssFunctions.length === 0) {
    return Object.assign(
      (_: unknown, classNames: ClassNameCollector) => {
        if (className) {
          classNames.add(className);
        }
      },
      { $dynamic: false },
    );
  }

  return Object.assign(
    (props: TProps, classNames: ClassNameCollector, allStyles: StyleObject) => {
      if (className) {
        classNames.add(className);
      }
      for (let i = 0; i < dynamicCssFunctions.length; i++) {
        unwrapProps(props, dynamicCssFunctions[i], classNames, allStyles);
      }
    },
    { $dynamic: true },
  );
}

// Dynamic CSS with runtime logic
const unwrapProps = (
  props: unknown,
  fn: NestedRuntimeStyleProcessor,
  classNames: ClassNameCollector,
  style: StyleObject,
) => {
  let result = fn(props, classNames, style);
  while (result) {
    if (typeof result === "function") {
      result = result(props, classNames, style);
      continue;
    } else if (typeof result === "object") {
      // accept both keys - "class" is Solid's attribute, "className"
      // keeps compatibility with framework-agnostic css() results
      const resultClassName = ("class" in result && result.class) || result.className;
      if (resultClassName) {
        classNames.add(resultClassName);
      }
      if ("style" in result && result.style) {
        for (const key in result.style) {
          // This is hard for typescript to infer
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
  // typeof guards first — the `process.env` lookup is a real per-call cost
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
