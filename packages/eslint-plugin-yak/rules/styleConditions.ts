import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
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
      requiresTypeChecking: true,
    },
    messages: {
      invalidRuntimeReturnValue:
        "When possible arrow functions in styled/css literals from next-yak should return css literals (css`...`) instead of inline values. CSS literals create a CSS class, which is better for performance.",
      invalidCssReturnValue:
        "CSS literals can not be converted into a css variable - try to move the css property also into the arrow function or remove the css``",
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => {
    const { importedNames, ImportDeclaration } = importsNextYak();
    return {
      ImportDeclaration,
      TaggedTemplateExpression(node: TSESTree.TaggedTemplateExpression) {
        if (
          importedNames.styled === undefined &&
          importedNames.css === undefined
        ) {
          return;
        }

        if (!node.parent || isStyledOrCssTag(node, importedNames) !== "css") {
          return;
        }
        const { tag, needle } = findClosestStyledOrCssTag(
          node.parent,
          importedNames,
        );
        if (!tag) {
          return;
        }

        const index = tag.quasi.expressions.findIndex(
          (expr) => expr === needle,
        );
        if (index === -1) {
          return;
        }

        const codeBefore = tag.quasi.quasis[index].value.raw;
        // Guess that if a quasi ends with a colon that it is a declaration e.g.
        // css`color: ${({ color }) => color}`
        const isDeclaration = codeBefore.trim().endsWith(":");
        if (!isDeclaration) {
          return;
        }

        context.report({
          node,
          messageId: "invalidCssReturnValue",
        });
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
        const { tag, params } = findClosestStyledOrCssTag(node, importedNames);
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

        if (
          returnValue &&
          !isNodeAccessingParams(returnValue, params, importedNames)
        ) {
          context.report({
            node: returnValue,
            messageId: "invalidRuntimeReturnValue",
          });
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
 * Verifies that node is a css literal from the given imported names
 *
 * e.g. css`color: red`
 */
function isCssLiteral(
  node: TSESTree.Node,
  importedNames: ImportedNames,
): boolean {
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
function isValidIdentifier(
  node: TSESTree.Node,
  params: TSESTree.Parameter[],
): boolean {
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
      (node.value === null ||
        node.value === false ||
        node.value === 0 ||
        node.value === "")) ||
    (node.type === AST_NODE_TYPES.Identifier &&
      (node.name === "undefined" || node.name === "null"))
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
        node.expressions.some((expr) =>
          isNodeAccessingParams(expr, params, importedNames),
        )
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
