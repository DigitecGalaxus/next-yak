import type { YakTheme } from "./index.d.ts";
import { RuntimeStyleProcessor } from "./publicStyledApi.js";

export const yakComponentSymbol = Symbol("yak");

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
  classNames: Set<string>,
  style: React.CSSProperties,
) =>
  | {
      className?: string;
      style?: React.CSSProperties;
    }
  | void
  | NestedRuntimeStyleProcessor;

/**
 * css() runtime factory of css``
 *
 * /!\ next-yak transpiles css`` and styled``
 *
 * This changes the typings of the css`` and styled`` functions.
 * During development the user of next-yak wants to work with the
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
export function css<TProps>(
  ...args: Array<any>
): RuntimeStyleProcessor<TProps> {
  // Normally this  could be an array of strings passed, but as we transpile the usage of css`` ourselves, we control the arguments
  // and ensure that only the first argument is a string (class name of the non-dynamic styles)
  let className: string | undefined;
  const dynamicCssFunctions: NestedRuntimeStyleProcessor[] = [];
  const style: Record<string, string> = {};
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
      for (const key in arg.style) {
        const value = arg.style[key];
        if (typeof value === "function") {
          dynamicCssFunctions.push((props: unknown) => ({
            style: {
              [key]: String(
                // The value for a css value can be a theme dependent function e.g.:
                // const borderColor = (props: { theme: { mode: "dark" | "light" } }) => props.theme === "dark" ? "black" : "white";
                // css`border-color: ${borderColor};`
                // Therefore the value has to be extracted recursively
                recursivePropExecution(props, value),
              ),
            },
          }));
        } else {
          style[key] = value;
        }
      }
    }
  }

  // Non Dynamic CSS
  // This is just an optimization for the common case where there are no dynamic css functions
  if (dynamicCssFunctions.length === 0) {
    return (_, classNames) => {
      if (className) {
        classNames.add(className);
      }
      return () => {};
    };
  }

  return (props, classNames, allStyles) => {
    if (className) {
      classNames.add(className);
    }
    for (let i = 0; i < dynamicCssFunctions.length; i++) {
      unwrapProps(props, dynamicCssFunctions[i], classNames, allStyles);
    }
  };
}

// Dynamic CSS with runtime logic
const unwrapProps = (
  props: unknown,
  fn: NestedRuntimeStyleProcessor,
  classNames: Set<string>,
  style: React.CSSProperties,
) => {
  let result = fn(props, classNames, style);
  while (result) {
    if (typeof result === "function") {
      result = result(props, classNames, style);
      continue;
    } else if (typeof result === "object") {
      if ("className" in result && result.className) {
        classNames.add(result.className);
      }
      if ("style" in result && result.style) {
        for (const key in result.style) {
          // This is hard for typescript to infer
          style[key as keyof React.CSSProperties] = result.style[
            key as keyof React.CSSProperties
          ] as any;
        }
      }
    }
    break;
  }
};

const recursivePropExecution = (
  props: unknown,
  fn: (props: unknown) => any,
): string | number => {
  const result = fn(props);
  if (typeof result === "function") {
    return recursivePropExecution(props, result);
  }
  if (process.env.NODE_ENV === "development") {
    if (
      typeof result !== "string" &&
      typeof result !== "number" &&
      !(result instanceof String)
    ) {
      throw new Error(
        `Dynamic CSS functions must return a string or number but returned ${JSON.stringify(
          result,
        )}\n\nDynamic CSS function: ${fn.toString()}\n`,
      );
    }
  }
  return result;
};
