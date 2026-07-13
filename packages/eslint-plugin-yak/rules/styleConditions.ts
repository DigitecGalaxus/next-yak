import { AST_NODE_TYPES, TSESLint, TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils.js";
import { importsNextYak, isStyledOrCssTag } from "./utils.js";

type ImportedNames = {
  styled?: string;
  css?: string;
};

export const styleConditions = createRule({
  name: "style-conditions",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforces that arrow functions only return runtime values or css literals in styled/css literals from next-yak",
      recommended: true,
      requiresTypeChecking: false,
    },
    messages: {
      invalidRuntimeReturnValue:
        "Arrow functions in next-yak styled/css literals should return either a css`...` literal (compiled to a CSS class) or a value derived from the component's props (a runtime CSS variable). Returning a constant does neither. If this is a fixed-set condition, move the declaration into the arrow function and return a css`...` literal. Keep the prop, don't hand-roll a CSS variable.",
      invalidRuntimeReturnValueWithExample:
        "`{{property}}` will be automatically compiled into a CSS variable because of the runtime condition, e.g. `{{property}}: var(--h45cH)`.\nFor your fixed-set condition return a static css declaration like {{example}} instead\n\nnext-yak compiles the static css declaration into a toggleable class name, resulting in better performance optimized JavaScript and HTML\n\nInstead of:\n  {{before}}\n\nwrite:\n  {{after}}",
      invalidCssReturnValueMoveProperty:
        "`{{property}}` is a static property, but the arrow returns a {{cssLiteral}} literal (a toggleable style chunk, not a value) that next-yak can't splice into a property it already wrote. Move the whole declaration inside the css literal like {{example}} instead.\n\nInstead of:\n  {{before}}\n\nwrite:\n  {{after}}",
      invalidCssReturnValueDropCss:
        "`{{property}}` wraps the runtime value `{{value}}` in a css`...` literal, which next-yak can't splice into a property it already wrote. Since the value comes from props, drop the css`` and return it directly so it compiles to a CSS variable.\n\nInstead of:\n  {{before}}\n\nwrite:\n  {{after}}",
      invalidCssReturnValue:
        "The CSS property is outside the arrow function but its value returns a css`...` literal, which next-yak can't combine into a single declaration. Move the whole declaration inside the css literal so it holds the property too, or drop the css`` and return a plain runtime value.",
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => {
    const { importedNames, ImportDeclaration } = importsNextYak();
    return {
      ImportDeclaration,
      TaggedTemplateExpression(node: TSESTree.TaggedTemplateExpression) {
        if (importedNames.styled === undefined && importedNames.css === undefined) {
          return;
        }

        if (!node.parent || isStyledOrCssTag(node, importedNames) !== "css") {
          return;
        }
        const { tag, needle, params } = findClosestStyledOrCssTag(node.parent, importedNames);
        if (!tag) {
          return;
        }

        const codeBefore = getQuasiBeforeExpression(tag, needle);
        // Guess that if a quasi ends with a colon that it is a declaration e.g.
        // css`color: ${({ color }) => color}`
        if (codeBefore === undefined || !codeBefore.trim().endsWith(":")) {
          return;
        }

        // Two opposite fixes hide behind this one situation, so detect which one
        // applies and show a tailored before/after instead of a vague "or":
        //  - a static value split out from its property -> move the property in
        //  - a prop-derived value needlessly wrapped in css -> drop the css``
        const trap = buildCssTrapExample({
          tag,
          needle,
          cssLiteral: node,
          params,
          importedNames,
          sourceCode: context.sourceCode,
        });
        if (trap?.kind === "move") {
          context.report({ node, messageId: "invalidCssReturnValueMoveProperty", data: trap.data });
        } else if (trap?.kind === "drop") {
          context.report({ node, messageId: "invalidCssReturnValueDropCss", data: trap.data });
        } else {
          context.report({ node, messageId: "invalidCssReturnValue" });
        }
      },

      /** All return statements in styled/css literals */
      "TaggedTemplateExpression :matches(ArrowFunctionExpression, ReturnStatement)"(
        node: TSESTree.ReturnStatement | TSESTree.ArrowFunctionExpression,
      ) {
        // Skip if this is an arrow function inside the .attrs method
        if (isInsideAttrsMethod(node)) {
          return;
        }

        // Params are used to detect valid runtime values
        // e.g. css`width: ${({ $size }) => $size}px`
        const { tag, params, needle } = findClosestStyledOrCssTag(node, importedNames);
        if (!tag) {
          return;
        }

        // Get the return value of the arrow function or the return statement
        // e.g. `() => 42` or () => { return 42 }`
        const returnValue =
          node.type === AST_NODE_TYPES.ReturnStatement
            ? node.argument
            : node.body.type !== AST_NODE_TYPES.BlockStatement
              ? node.body
              : undefined;

        if (returnValue && !isNodeAccessingParams(returnValue, params, importedNames)) {
          // When the offending value is a simple fixed-set condition (ternary or
          // `&&` with literal values) we can render a concrete before/after so the
          // reader knows the exact class-toggle rewrite instead of guessing.
          const example = buildRuntimeExample({
            tag,
            needle,
            returnValue,
            importedNames,
            sourceCode: context.sourceCode,
          });
          if (example) {
            context.report({
              node: returnValue,
              messageId: "invalidRuntimeReturnValueWithExample",
              data: example,
            });
          } else {
            context.report({
              node: returnValue,
              messageId: "invalidRuntimeReturnValue",
            });
          }
        }
      },
    };
  },
});

/**
 * Searches the node and its parents for the first css``, styled.sth`` or styled(Component)``
 */
function findClosestStyledOrCssTag(
  node: TSESTree.Node,
  importedNames: ImportedNames,
):
  | {
      tag: undefined;
      type: undefined;
      needle: TSESTree.Node;
      params: TSESTree.Parameter[];
    }
  | {
      tag: TSESTree.TaggedTemplateExpression;
      type: "css" | "styled";
      needle: TSESTree.Node;
      params: TSESTree.Parameter[];
    } {
  let current: TSESTree.Node | undefined = node;
  let params: TSESTree.Parameter[] = [];
  let needle: TSESTree.Node = node;

  while (current) {
    if (current.type === AST_NODE_TYPES.ArrowFunctionExpression) {
      params = current.params;
    } else {
      const type = isStyledOrCssTag(current, importedNames);
      if (type && current.type === AST_NODE_TYPES.TaggedTemplateExpression) {
        return { tag: current, needle, params, type };
      }
    }
    if (current.type !== AST_NODE_TYPES.TemplateLiteral) {
      needle = current;
    }
    current = current.parent;
  }

  return { tag: undefined, needle, type: undefined, params };
}

/**
 * Builds a concrete before/after example for the error message when the offending
 * value is a simple fixed-set condition (a ternary or `&&` with literal values).
 * Returns undefined when no clean example can be rendered, so the caller falls back
 * to the generic message.
 *
 * e.g. `z-index: ${({ $kind }) => $kind === "second" ? 4 : 3}` becomes
 *   before: z-index: ${({ $kind }) => $kind === "second" ? 4 : 3}
 *   after:  z-index: 3;
 *           ${({ $kind }) => $kind === "second" && css`z-index: 4;`}
 */
function buildRuntimeExample({
  tag,
  needle,
  returnValue,
  importedNames,
  sourceCode,
}: {
  tag: TSESTree.TaggedTemplateExpression;
  needle: TSESTree.Node;
  returnValue: TSESTree.Node;
  importedNames: ImportedNames;
  sourceCode: TSESLint.SourceCode;
}): { property: string; before: string; after: string; example: string } | undefined {
  if (needle.type !== AST_NODE_TYPES.ArrowFunctionExpression) {
    return undefined;
  }
  const property = getDeclarationProperty(tag, needle);
  if (!property) {
    return undefined;
  }
  const paramText = needle.params.length > 0 ? sourceCode.getText(needle.params[0]) : "";
  const cssName = importedNames.css ?? "css";
  const built = buildAfterExample({ property, paramText, returnValue, cssName, sourceCode });
  if (!built) {
    return undefined;
  }
  const before = `${property}: \${${sourceCode.getText(needle)}}`;
  return { property, before, after: built.after, example: built.example };
}

/**
 * Builds a tailored before/after for the "css literal used as a declaration value"
 * situation (`property: ${() => cond && css`value`}`), which has two opposite fixes:
 *
 *  - "move": a static value split out from its property -> move the property inside
 *    the css literal, so it becomes a toggleable class (`${cond && css`property: value;`}`).
 *  - "drop": a prop-derived value needlessly wrapped in css -> drop the css`` and
 *    return the value directly, so it compiles to a CSS variable.
 *
 * Only handles the simple shapes (`() => css`...`` and `() => cond && css`...``) where
 * the css literal is the arrow's tail; anything else returns undefined so the caller
 * falls back to the generic message. Declarations already living inside the css literal
 * (`css`color: red`` under an outer `color:`) also fall back, to avoid duplicating the
 * property.
 */
function buildCssTrapExample({
  tag,
  needle,
  cssLiteral,
  params,
  importedNames,
  sourceCode,
}: {
  tag: TSESTree.TaggedTemplateExpression;
  needle: TSESTree.Node;
  cssLiteral: TSESTree.TaggedTemplateExpression;
  params: TSESTree.Parameter[];
  importedNames: ImportedNames;
  sourceCode: TSESLint.SourceCode;
}):
  | {
      kind: "move";
      data: {
        property: string;
        cssLiteral: string;
        example: string;
        before: string;
        after: string;
      };
    }
  | { kind: "drop"; data: { property: string; value: string; before: string; after: string } }
  | undefined {
  if (needle.type !== AST_NODE_TYPES.ArrowFunctionExpression) {
    return undefined;
  }
  const property = getDeclarationProperty(tag, needle);
  if (!property) {
    return undefined;
  }
  // Only the shapes where the css literal is the arrow's tail expression are safe to
  // reconstruct; a two-branch ternary (`cond ? css`a` : css`b``) would leave the other
  // branch's trap in place, so bail to the generic message.
  const body = needle.body;
  const isDirect = body === cssLiteral;
  const isAndTail =
    body.type === AST_NODE_TYPES.LogicalExpression &&
    body.operator === "&&" &&
    body.right === cssLiteral;
  if (!isDirect && !isAndTail) {
    return undefined;
  }

  const arrowSrc = sourceCode.getText(needle);
  const oldCss = sourceCode.getText(cssLiteral);
  // The exact source between the css`` backticks, preserving any `${...}` interpolations.
  const innerRaw = sourceCode.getText(cssLiteral.quasi).slice(1, -1);
  const before = `${property}: \${${arrowSrc}}`;

  // If the css literal already contains a full declaration (`color: red`), the only
  // clean fix is removing the outer property; leave that to the generic message.
  if (/^\s*[\w-]+\s*:/.test(innerRaw)) {
    return undefined;
  }

  // "drop": the wrapped value reads a prop, so it belongs in a runtime CSS variable.
  const wrapsProp = cssLiteral.quasi.expressions.some((expr) =>
    isNodeAccessingParams(expr, params, importedNames),
  );
  if (wrapsProp) {
    const newArrow = arrowSrc.replace(oldCss, () => sourceCode.getText(cssLiteral.quasi));
    return {
      kind: "drop",
      data: { property, value: innerRaw, before, after: `${property}: \${${newArrow}}` },
    };
  }

  // "move": a bare static value -> fold the property into the css literal.
  const cssName = sourceCode.getText(cssLiteral.tag);
  const example = `${cssName}\`${property}: ${innerRaw.trim()};\``;
  const newArrow = arrowSrc.replace(oldCss, () => example);
  return {
    kind: "move",
    data: { property, cssLiteral: oldCss, example, before, after: `\${${newArrow}}` },
  };
}

/**
 * Returns the raw text of the template quasi immediately before `needle`'s
 * interpolation, or undefined when `needle` isn't a top-level expression of the
 * tag. e.g. for `z-index: ${needle}` it returns `"z-index: "`.
 */
function getQuasiBeforeExpression(
  tag: TSESTree.TaggedTemplateExpression,
  needle: TSESTree.Node,
): string | undefined {
  const index = tag.quasi.expressions.findIndex((expr) => expr === needle);
  if (index === -1) {
    return undefined;
  }
  return tag.quasi.quasis[index].value.raw;
}

/**
 * Reads the CSS property name from the quasi directly before the interpolation.
 * e.g. the `z-index` in `z-index: ${() => ...}`. Returns undefined if the arrow
 * function isn't sitting in a declaration position (`property: ${...}`).
 */
function getDeclarationProperty(
  tag: TSESTree.TaggedTemplateExpression,
  needle: TSESTree.Node,
): string | undefined {
  const before = getQuasiBeforeExpression(tag, needle)?.trimEnd();
  if (before === undefined || !before.endsWith(":")) {
    return undefined;
  }
  const match = before.slice(0, -1).match(/([a-zA-Z-]+)\s*$/);
  return match ? match[1] : undefined;
}

/**
 * Renders a static CSS value for literal-like nodes only (string/number literals
 * and zero-expression template literals). Returns undefined for anything dynamic,
 * which signals that no clean example can be built.
 */
function renderCssValue(node: TSESTree.Node): string | undefined {
  if (node.type === AST_NODE_TYPES.Literal) {
    if (typeof node.value === "string") return node.value;
    if (typeof node.value === "number") return String(node.value);
    return undefined;
  }
  if (node.type === AST_NODE_TYPES.TemplateLiteral && node.expressions.length === 0) {
    return node.quasis[0].value.cooked ?? undefined;
  }
  return undefined;
}

/**
 * Builds the "after" snippet (the class-based toggle) for a ternary or `&&`
 * expression whose branch values are literals. Also returns `example`: the bare
 * css`...` literal for the toggled declaration, used inline in the message.
 */
function buildAfterExample({
  property,
  paramText,
  returnValue,
  cssName,
  sourceCode,
}: {
  property: string;
  paramText: string;
  returnValue: TSESTree.Node;
  cssName: string;
  sourceCode: TSESLint.SourceCode;
}): { after: string; example: string } | undefined {
  const head = `(${paramText}) =>`;

  if (returnValue.type === AST_NODE_TYPES.ConditionalExpression) {
    if (!isValidTestExpression(returnValue.test)) {
      return undefined;
    }
    const consequent = renderCssValue(returnValue.consequent);
    const alternate = renderCssValue(returnValue.alternate);
    if (consequent === undefined || alternate === undefined) {
      return undefined;
    }
    const test = sourceCode.getText(returnValue.test);
    const example = `${cssName}\`${property}: ${consequent};\``;
    return {
      after: `${property}: ${alternate};\n  \${${head} ${test} && ${example}}`,
      example,
    };
  }

  if (returnValue.type === AST_NODE_TYPES.LogicalExpression && returnValue.operator === "&&") {
    const value = renderCssValue(returnValue.right);
    if (value === undefined) {
      return undefined;
    }
    const test = sourceCode.getText(returnValue.left);
    const example = `${cssName}\`${property}: ${value};\``;
    return { after: `\${${head} ${test} && ${example}}`, example };
  }

  return undefined;
}

/**
 * Verifies that node is a css literal from the given imported names
 *
 * e.g. css`color: red`
 */
function isCssLiteral(node: TSESTree.Node, importedNames: ImportedNames): boolean {
  return (
    node.type === AST_NODE_TYPES.TaggedTemplateExpression &&
    node.tag.type === AST_NODE_TYPES.Identifier &&
    node.tag.name === importedNames.css
  );
}

/**
 * Verifies that node is a valid identifier from the given params
 * Either a identifier or a member expression.
 *
 * In this example foo and foo.bar are valid:
 * `(foo) => foo.bar` or `(foo) => foo`
 */
function isValidIdentifier(node: TSESTree.Node, params: TSESTree.Parameter[]): boolean {
  if (node.type === AST_NODE_TYPES.Identifier) {
    return params.some((param) => {
      if (param.type === AST_NODE_TYPES.Identifier) {
        return param.name === node.name;
      }
      if (param.type === AST_NODE_TYPES.ObjectPattern) {
        return param.properties.some(
          (prop) =>
            prop.type === AST_NODE_TYPES.Property &&
            prop.key.type === AST_NODE_TYPES.Identifier &&
            prop.key.name === node.name,
        );
      }
      return false;
    });
  }
  if (node.type === AST_NODE_TYPES.MemberExpression) {
    return isValidIdentifier(node.object, params);
  }
  return false;
}

function isFalsyLiteral(node: TSESTree.Node): boolean {
  return (
    (node.type === AST_NODE_TYPES.Literal &&
      (node.value === null || node.value === false || node.value === 0 || node.value === "")) ||
    (node.type === AST_NODE_TYPES.Identifier && (node.name === "undefined" || node.name === "null"))
  );
}

/**
 * Verifies that the expression uses a value fro the params
 */
function isNodeAccessingParams(
  node: TSESTree.Node,
  params: TSESTree.Parameter[],
  importedNames: ImportedNames,
): boolean {
  switch (node.type) {
    case AST_NODE_TYPES.Literal:
      // A literal is not a runtime value
      return false;
    case AST_NODE_TYPES.TemplateLiteral:
      // If at least one expression uses a runtime value, the whole template literal is valid
      return (
        node.expressions.length > 0 &&
        node.expressions.some((expr) => isNodeAccessingParams(expr, params, importedNames))
      );
    case AST_NODE_TYPES.Identifier:
      // An identifier is valid if it's a parameter
      return isValidIdentifier(node, params);
    case AST_NODE_TYPES.MemberExpression:
      //
      return isValidIdentifier(node, params);
    case AST_NODE_TYPES.TaggedTemplateExpression:
      return isCssLiteral(node, importedNames);
    case AST_NODE_TYPES.LogicalExpression:
      // logical operators are valid if the left side is a valid test expression
      // e.g.: isLarge($size) && css`width: 100px`
      if (node.operator === "&&" && isValidTestExpression(node.left)) {
        return isNodeAccessingParams(node.right, params, importedNames);
      }
      // && and || are valid if both sides are valid
      return (
        isNodeAccessingParams(node.left, params, importedNames) &&
        isNodeAccessingParams(node.right, params, importedNames)
      );
    case AST_NODE_TYPES.ConditionalExpression:
      return (
        isValidTestExpression(node.test) &&
        (isNodeAccessingParams(node.consequent, params, importedNames) ||
          isNodeAccessingParams(node.alternate, params, importedNames))
      );
    case AST_NODE_TYPES.BinaryExpression:
      // Other binary expressions like +, -, etc. are valid if at least one side is a runtime value
      return (
        isNodeAccessingParams(node.left, params, importedNames) ||
        isNodeAccessingParams(node.right, params, importedNames)
      );
    case AST_NODE_TYPES.CallExpression:
      // A call is a runtime value if the callee or any argument is prop-derived, e.g. Math.max(6, $baseWidth)
      return (
        isNodeAccessingParams(node.callee, params, importedNames) ||
        node.arguments.some((argument) =>
          isNodeAccessingParams(
            argument.type === AST_NODE_TYPES.SpreadElement ? argument.argument : argument,
            params,
            importedNames,
          ),
        )
      );
    case AST_NODE_TYPES.UnaryExpression:
      return isNodeAccessingParams(node.argument, params, importedNames);
    default:
      return isFalsyLiteral(node);
  }
}

/**
 * Expressions that can be used as test expressions in logical operators or conditionals
 */
function isValidTestExpression(node: TSESTree.Node): boolean {
  switch (node.type) {
    // true or false
    case AST_NODE_TYPES.Literal:
      return node.value === true || node.value === false;
    // x
    case AST_NODE_TYPES.Identifier:
      return true;
    // x.isLarge
    case AST_NODE_TYPES.MemberExpression:
      return true;
    // !x
    case AST_NODE_TYPES.UnaryExpression:
      return true;
    // test(x)
    case AST_NODE_TYPES.CallExpression:
      return true;
    // x === 4
    case AST_NODE_TYPES.LogicalExpression:
      return true;
    // x > 4
    case AST_NODE_TYPES.BinaryExpression:
      return true;
    default:
      return false;
  }
}

/**
 * Checks if a node is inside the attrs method of a styled component
 */
function isInsideAttrsMethod(node: TSESTree.Node): boolean {
  let current: TSESTree.Node | undefined = node;

  while (current && current.parent) {
    // Check if parent is a CallExpression
    if (current.parent.type === AST_NODE_TYPES.CallExpression) {
      const callExpr = current.parent;

      // Check if the callee is a MemberExpression
      if (callExpr.callee.type === AST_NODE_TYPES.MemberExpression) {
        const memberExpr = callExpr.callee;

        // Check if the property name is 'attrs'
        if (
          memberExpr.property.type === AST_NODE_TYPES.Identifier &&
          memberExpr.property.name === "attrs"
        ) {
          return true;
        }
      }
    }
    current = current.parent;
  }

  return false;
}
