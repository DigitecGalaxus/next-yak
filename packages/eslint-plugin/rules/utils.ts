import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

export const importsNextYak = () => {
  /** track the imported names for css and styled from next-yak */
  const importedNames: ImportedNames = {};

  return {
    importedNames,
    ImportDeclaration(node: TSESTree.ImportDeclaration) {
      if (node.source.value === "next-yak") {
        node.specifiers.forEach((specifier) => {
          if (
            specifier.type === AST_NODE_TYPES.ImportSpecifier &&
            specifier.imported.type === AST_NODE_TYPES.Identifier
          ) {
            if (specifier.imported.name === "styled") {
              importedNames.styled = specifier.local.name;
            } else if (specifier.imported.name === "css") {
              importedNames.css = specifier.local.name;
            }
          }
        });
      }
    },
  };
};

export type ImportedNames = {
  styled?: string;
  css?: string;
};

export function isStyledOrCssTag(
  node: TSESTree.Node,
  importedNames: ImportedNames,
): false | "styled" | "css" {
  if (node.type !== AST_NODE_TYPES.TaggedTemplateExpression) {
    return false;
  }
  const { tag } = node;

  // Check for simple styled`` or css``
  if (
    tag.type === AST_NODE_TYPES.Identifier &&
    (tag.name === importedNames.styled || tag.name === importedNames.css)
  ) {
    return "css";
  }
  // Check for styled.button`` or styled(Component)``
  if (tag.type === AST_NODE_TYPES.MemberExpression) {
    return tag.object.type === AST_NODE_TYPES.Identifier &&
      tag.object.name === importedNames.styled
      ? ("styled" as const)
      : false;
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

          return callExpression.callee.type === AST_NODE_TYPES.Identifier &&
            callExpression.callee.name === importedNames.styled
            ? "styled"
            : false;
        }
        // styled.button.attrs()
        else if (
          memberExpression.object.type === AST_NODE_TYPES.MemberExpression
        ) {
          const memberExpressionObject =
            memberExpression.object as TSESTree.MemberExpression;
          return memberExpressionObject.object.type ===
            AST_NODE_TYPES.Identifier &&
            memberExpressionObject.object.name === importedNames.styled
            ? "styled"
            : false;
        }
      }
    }

    // Check for styled()
    return tag.callee.type === AST_NODE_TYPES.Identifier &&
      tag.callee.name === importedNames.styled
      ? "styled"
      : false;
  }

  return false;
}
