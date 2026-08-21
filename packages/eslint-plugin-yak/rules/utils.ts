import type { ESTree } from "@oxlint/plugins";

export const importsNextYak = () => {
  /** track the imported names for css and styled from next-yak */
  const importedNames: ImportedNames = {};

  return {
    importedNames,
    before() {
      importedNames.styled = undefined;
      importedNames.css = undefined;
    },
    ImportDeclaration(node: ESTree.ImportDeclaration) {
      if (node.source.value === "next-yak") {
        node.specifiers.forEach((specifier) => {
          if (specifier.type === "ImportSpecifier" && specifier.imported.type === "Identifier") {
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
  node: ESTree.Node,
  importedNames: ImportedNames,
): false | "styled" | "css" {
  if (node.type !== "TaggedTemplateExpression") {
    return false;
  }
  const { tag } = node;

  // Check for simple styled`` or css``
  if (tag.type === "Identifier") {
    if (tag.name === importedNames.styled) {
      return "styled";
    }
    if (tag.name === importedNames.css) {
      return "css";
    }
  }
  // Check for styled.button`` or styled(Component)``
  if (tag.type === "MemberExpression") {
    return tag.object.type === "Identifier" && tag.object.name === importedNames.styled
      ? ("styled" as const)
      : false;
  }
  // Check for styled(button)`` or styled(button).attrs()`` or styled.div.attrs()``
  if (tag.type === "CallExpression") {
    // Check for attrs() method
    if (tag.callee.type === "MemberExpression") {
      const callee = tag.callee as ESTree.MemberExpression;
      if (callee.property.type === "Identifier" && callee.property.name === "attrs") {
        const memberExpression = callee.property.parent as ESTree.MemberExpression;

        // styled(button).attrs()
        if (memberExpression.object.type === "CallExpression") {
          const callExpression = memberExpression.object as ESTree.CallExpression;

          return callExpression.callee.type === "Identifier" &&
            callExpression.callee.name === importedNames.styled
            ? "styled"
            : false;
        }
        // styled.button.attrs()
        else if (memberExpression.object.type === "MemberExpression") {
          const memberExpressionObject = memberExpression.object as ESTree.MemberExpression;
          return memberExpressionObject.object.type === "Identifier" &&
            memberExpressionObject.object.name === importedNames.styled
            ? "styled"
            : false;
        }
      }
    }

    // Check for styled()
    return tag.callee.type === "Identifier" && tag.callee.name === importedNames.styled
      ? "styled"
      : false;
  }

  return false;
}
