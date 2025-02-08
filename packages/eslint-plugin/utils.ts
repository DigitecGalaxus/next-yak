import { AST_NODE_TYPES, ESLintUtils, TSESTree } from "@typescript-eslint/utils";

export interface EsLintPluginYakRuleDocs {
  description: string;
  recommended?: boolean;
  requiresTypeChecking?: boolean;
}

export const createRule = ESLintUtils.RuleCreator<EsLintPluginYakRuleDocs>(
  (name) =>
    `https://github.com/DigitecGalaxus/next-yak/packages/eslint-plugin/docs/${name}.md`,
);


export type ImportedNames = {
  styled?: string;
  css?: string;
};

export function isStyledOrCssTag(
  node: TSESTree.Node,
  importedNames: ImportedNames,
): boolean {
  if (node.type !== AST_NODE_TYPES.TaggedTemplateExpression) {
    return false;
  }
  const { tag } = node;

  // Check for simple styled`` or css``
  if (
    tag.type === AST_NODE_TYPES.Identifier &&
    (tag.name === importedNames.styled || tag.name === importedNames.css)
  ) {
    return true;
  }
  // Check for styled.button`` or styled(Component)``
  if (tag.type === AST_NODE_TYPES.MemberExpression) {
    return (
      tag.object.type === AST_NODE_TYPES.Identifier &&
      tag.object.name === importedNames.styled
    );
  }
  // Check for styled(button)`` or styled(button).attrs()`` or styled.div.attrs()``
  if (tag.type === AST_NODE_TYPES.CallExpression) {
    // Check for attrs() method
    if (tag.callee.type === AST_NODE_TYPES.MemberExpression) {
      const callee = tag.callee as TSESTree.MemberExpression;
      if (
        callee.property.type === AST_NODE_TYPES.Identifier &&
        callee.property.name === "attrs"
      ) {
        const memberExpression = callee.property
          .parent as TSESTree.MemberExpression;

        // styled(button).attrs()
        if (memberExpression.object.type === AST_NODE_TYPES.CallExpression) {
          const callExpression =
            memberExpression.object as TSESTree.CallExpression;

          return (
            callExpression.callee.type === AST_NODE_TYPES.Identifier &&
            callExpression.callee.name === importedNames.styled
          );
        }
        // styled.button.attrs()
        else if (
          memberExpression.object.type === AST_NODE_TYPES.MemberExpression
        ) {
          const memberExpressionObject =
            memberExpression.object as TSESTree.MemberExpression;
          return (
            memberExpressionObject.object.type === AST_NODE_TYPES.Identifier &&
            memberExpressionObject.object.name === importedNames.styled
          );
        }
      }
    }

    // Check for styled()
    return (
      tag.callee.type === AST_NODE_TYPES.Identifier &&
      tag.callee.name === importedNames.styled
    );
  }

  return false;
}
