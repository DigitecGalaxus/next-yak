import type { YakTheme } from "./index.d.ts";

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

export type PropsToClassNameFn = (props: unknown) =>
  | {
      className?: string;
      style?: Record<string, string>;
    }
  | PropsToClassNameFn;

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
 */
export function css<TProps>(
  styles: TemplateStringsArray,
  ...values: CSSInterpolation<NoInfer<TProps> & { theme: YakTheme }>[]
): ComponentStyles<TProps>;
export function css<TProps>(...args: Array<any>): ComponentStyles<TProps> {
  const classNames: string[] = [];
  const dynamicCssFunctions: PropsToClassNameFn[] = [];
  const style: Record<string, string> = {};
  for (const arg of args as Array<string | CSSFunction | CSSStyles<any>>) {
    // A CSS-module class name which got auto generated during build from static css
    // e.g. css`color: red;`
    // compiled -> css("yak31e4")
    if (typeof arg === "string") {
      classNames.push(arg);
    }
    // Dynamic CSS e.g.
    // css`${props => props.active && css`color: red;`}`
    // compiled -> css((props: { active: boolean }) => props.active && css("yak31e4"))
    else if (typeof arg === "function") {
      dynamicCssFunctions.push(arg as unknown as PropsToClassNameFn);
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
  if (dynamicCssFunctions.length === 0) {
    const className = classNames.join(" ");
    return () => ({ className, style });
  }

  return (props: unknown) => {
    const allClassNames: string[] = [...classNames];
    const allStyles: Record<string, string> = { ...style };
    for (let i = 0; i < dynamicCssFunctions.length; i++) {
      unwrapProps(props, dynamicCssFunctions[i], allClassNames, allStyles);
    }
    return {
      className: allClassNames.join(" "),
      style: allStyles,
    };
  };
}

// Dynamic CSS with runtime logic
const unwrapProps = (
  props: unknown,
  fn: PropsToClassNameFn,
  classNames: string[],
  style: Record<string, string>,
) => {
  let result = fn(props);
  while (result) {
    if (typeof result === "function") {
      result = result(props);
      continue;
    } else if (typeof result === "object") {
      if ("className" in result && result.className) {
        classNames.push(result.className);
      }
      if ("style" in result && result.style) {
        for (const key in result.style) {
          style[key] = result.style[key];
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
