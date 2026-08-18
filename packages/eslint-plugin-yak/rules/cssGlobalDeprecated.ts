import type { ESTree, Location } from "@oxlint/plugins";
import { createRule } from "../utils.js";
import { importsNextYak, isStyledOrCssTag } from "./utils.js";

// Simple regex to find :global() selectors
// Note: This doesn't handle nested parentheses like :global(html:has(div))
// but that's a rare edge case and acceptable for linting purposes
const GLOBAL_SELECTOR_REGEX = /:global\([^)]*\)/g;

export const cssGlobalDeprecated = createRule("css-global-deprecated", {
  meta: {
    type: "problem",
    docs: {
      description: "Deprecates :global() selectors in favor of native CSS transpilation",
    },
    messages: {
      globalSelectorDeprecated:
        ":global() selectors are deprecated and will be removed in the next major version.\n\n" +
        "To migrate to native CSS transpilation, add to your next.config.js:\n" +
        "experiments: { transpilationMode: 'Css' }\n\n" +
        "See https://yak.js.org/docs/migration-to-native-css for migration guide.",
    },
    schema: [],
    defaultOptions: [],
  },
  createOnce: (context) => {
    const { before, importedNames, ImportDeclaration } = importsNextYak();
    return {
      before,
      ImportDeclaration,
      /** All return statements in styled/css literals */
      TaggedTemplateExpression(node: ESTree.TaggedTemplateExpression) {
        if (importedNames.styled === undefined && importedNames.css === undefined) {
          return;
        }

        const templateLiteral = node.quasi;

        if (
          !templateLiteral ||
          templateLiteral.type !== "TemplateLiteral" ||
          // No next-yak imports
          (importedNames.styled === undefined && importedNames.css === undefined) ||
          // Not a styled or css tag
          !isStyledOrCssTag(node, importedNames) ||
          // As we check full code of a template literal (including nested literals),
          // Don't check nested template literals as we check full content of a template literal.
          hasParentTaggedTemplateExpression(node)
        ) {
          return;
        }

        // Returns raw code of the template literal `...`
        const codeRaw = context.sourceCode.getText(templateLiteral);
        if (!codeRaw) {
          return;
        }

        // Find all :global() selectors in the code
        // Since ESLint runs on source code (not compiled), any :global() found is user-written
        const selectorRegex = new RegExp(GLOBAL_SELECTOR_REGEX);
        let match: RegExpExecArray | null;
        while ((match = selectorRegex.exec(codeRaw)) !== null) {
          const loc = getMatchLocation(codeRaw, templateLiteral, match.index, match[0].length);

          context.report({
            node: templateLiteral,
            messageId: "globalSelectorDeprecated",
            loc,
          });
        }
      },
    };
  },
});

/**
 * Checks if the parent expression is a tagged template expression
 */
function hasParentTaggedTemplateExpression(node: ESTree.Node, maxLevels = 5): boolean {
  let currentLevel = 1;
  let currentNode: ESTree.Node | null = node.parent;

  while (currentNode && currentLevel < maxLevels) {
    if (currentNode.type === "TaggedTemplateExpression") {
      return true;
    }

    currentNode = currentNode.parent;
    currentLevel++;
  }

  return false;
}

/**
 * Maps a regex match to a location in the template literal
 */
function getMatchLocation(
  sourceCode: string,
  templateLiteral: ESTree.TemplateLiteral,
  matchIndex: number,
  matchLength: number,
): Location {
  const templateStart = templateLiteral.range[0];
  const matchStart = templateStart + matchIndex + 1; // +1 for backtick
  const matchEnd = matchStart + matchLength;

  // Convert character positions to line/column
  const lines = sourceCode.split("\n");
  let currentPos = templateStart + 1; // Start after opening backtick
  let startLine = 0;
  let startColumn = 0;
  let endLine = 0;
  let endColumn = 0;

  // Find start position
  for (let i = 0; i < lines.length; i++) {
    const lineLength = lines[i].length + 1; // +1 for newline
    if (currentPos + lineLength > matchStart) {
      startLine = i;
      startColumn = matchStart - currentPos;
      break;
    }
    currentPos += lineLength;
  }

  // Find end position
  currentPos = templateStart + 1;
  for (let i = 0; i < lines.length; i++) {
    const lineLength = lines[i].length + 1; // +1 for newline
    if (currentPos + lineLength > matchEnd) {
      endLine = i;
      endColumn = matchEnd - currentPos;
      break;
    }
    currentPos += lineLength;
  }

  return {
    start: {
      line: templateLiteral.loc.start.line + startLine,
      column: startLine === 0 ? templateLiteral.loc.start.column + startColumn : startColumn,
    },
    end: {
      line: templateLiteral.loc.start.line + endLine,
      column: endLine === 0 ? templateLiteral.loc.start.column + endColumn : endColumn,
    },
  };
}
