import type {
  css as cssInternal,
  NestedRuntimeStyleProcessor,
} from "../cssLiteral.js";

export type { ComponentStyles, CSSInterpolation } from "../cssLiteral.js";

/**
 * Allows to use CSS styles in a styled or css block
 *
 * e.g.
 *
 * ```tsx
 * const Component = styled.div`
 *  color: black;
 *  ${({$active}) => $active && css`color: red;`}
 * `;
 * ```
 */
export const css: typeof cssInternal = (
  styles: TemplateStringsArray,
  ...args: unknown[]
) => {
  // When called in yak files as a template tag (without SWC transformation),
  // return { __yak: rawCss } so the cross-file resolver can
  // extract the mixin value from evaluated .yak files.
  if (Array.isArray(styles) && "raw" in styles) {
    let rawCss = styles[0];
    for (let i = 0; i < args.length; i++) {
      const interpolation = args[i];
      rawCss +=
        interpolation &&
        typeof interpolation === "object" &&
        "__yak" in interpolation
          ? (interpolation as { __yak: string }).__yak
          : String(interpolation);
      rawCss += styles[i + 1];
    }
    return { __yak: rawCss } as any;
  }

  const dynamicCssFunctions: NestedRuntimeStyleProcessor[] = [];
  for (const arg of args as Array<string | Function | object>) {
    // Dynamic CSS e.g.
    // css`${props => props.active && css`color: red;`}`
    // compiled -> css((props: { active: boolean }) => props.active && css("yak31e4"))
    if (typeof arg === "function") {
      dynamicCssFunctions.push(arg as unknown as NestedRuntimeStyleProcessor);
    }
  }
  if (dynamicCssFunctions.length === 0) {
    return {
      className: "",
      style: undefined,
    };
  }
  return ((props: unknown) => {
    for (let i = 0; i < dynamicCssFunctions.length; i++) {
      // run the dynamic expressions and ignore the return value
      // the execution is important to ensure that the user code is executed
      // the same way as in the real runtime
      executeDynamicExpressionRecursively(props, dynamicCssFunctions[i]);
    }
    return {
      className: "",
      style: undefined,
    };
  }) as any;
};

function executeDynamicExpressionRecursively(
  props: unknown,
  expression: NestedRuntimeStyleProcessor,
) {
  const classNames = new Set<string>();
  const style = {};
  let result = expression(props, classNames, style);
  while (typeof result === "function") {
    result = result(props, classNames, style);
  }
  return result;
}
