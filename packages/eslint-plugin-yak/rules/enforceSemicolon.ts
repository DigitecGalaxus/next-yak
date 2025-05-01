import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils.js";
import { importsNextYak, isStyledOrCssTag } from "./utils.js";

export const enforceSemicolons = createRule({
  name: "enforce-semicolons",
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforces that expression in styled/css literals from next-yak use semicolons",
    },
    messages: {
      lonelyExpression:
        "Expressions must have a selector, an opening bracket or semicolon in the same line\nDid you forget a semicolon?",
    },
    fixable: "code",
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

        const templateLiteral = node.quasi;
        if (!templateLiteral || !isStyledOrCssTag(node, importedNames)) {
          return;
        }

        if (templateLiteral.type !== AST_NODE_TYPES.TemplateLiteral) {
          throw new Error("Unexpected AST - bug in yakEnforceSemicolons");
        }

        // Look for all identifier expression inside the template e.g. ${foo} or ${foo.bar}
        templateLiteral.expressions.forEach((expression, index) => {
          if (
            expression.type !== AST_NODE_TYPES.Identifier &&
            expression.type !== AST_NODE_TYPES.MemberExpression
          ) {
            return;
          }

          const codeBefore = getQuasiValue(templateLiteral.quasis[index]);
          const codeAfter = getQuasiValue(templateLiteral.quasis[index + 1]);

          const codeBeforeIsWhitespaceOnly = !codeBefore.trim();
          const isFirstExpression = codeBeforeIsWhitespaceOnly && index === 0;
          const isAloneInLine =
            (isFirstExpression || codeBefore.match(/\n\s*$/)) &&
            (!codeAfter || codeAfter.match(/^\s*\n/));

          // A Mixin is always alone in a line.
          if (!isAloneInLine) {
            return;
          }

          const previousExpressionType =
            templateLiteral.expressions[index - 1]?.type;
          const previousExpressionIsTerminating =
            previousExpressionType === AST_NODE_TYPES.ArrowFunctionExpression ||
            previousExpressionType === AST_NODE_TYPES.ConditionalExpression ||
            previousExpressionType === AST_NODE_TYPES.LogicalExpression;

          // check if the code before ends with a semicolon or a bracket or is an arrow function
          if (
            isFirstExpression ||
            (previousExpressionIsTerminating && codeBeforeIsWhitespaceOnly) ||
            codeBefore.match(/[;{}]\s*$/)
          ) {
            context.report({
              node: expression,
              messageId: "lonelyExpression",
              fix: (fixer) => {
                return fixer.insertTextAfterRange(
                  [expression.range[0], expression.range[1] + 1],
                  ";",
                );
              },
            });
          }
        });
      },
    };
  },
});

function getQuasiValue(quasi: TSESTree.TemplateElement | undefined) {
  if (!quasi) {
    return "";
  }
  return quasi.value.cooked;
}
