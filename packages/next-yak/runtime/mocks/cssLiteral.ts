import type { css as cssInternal, PropsToClassNameFn } from "../cssLiteral.js";

export type { StaticCSSProp, CSSInterpolation } from "../cssLiteral.js";

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
  const dynamicCssFunctions: PropsToClassNameFn[] = [];
  for (const arg of args as Array<string | Function | object>) {
    // Dynamic CSS e.g.
    // css`${props => props.active && css`color: red;`}`
    // compiled -> css((props: { active: boolean }) => props.active && css("yak31e4"))
    if (typeof arg === "function") {
      dynamicCssFunctions.push(arg as unknown as PropsToClassNameFn);
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
  expression: PropsToClassNameFn,
) {
  let result = expression(props);
  while (typeof result === "function") {
    result = result(props);
  }
  return result;
}
