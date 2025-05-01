import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import type { RuleFixer } from "@typescript-eslint/utils/ts-eslint";
import { createRule } from "../utils.js";
import { importsNextYak, isStyledOrCssTag } from "./utils.js";

export const cssNestingOperator = createRule({
  name: "css-nesting-operator",
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforces css selectors in next-yak to correctly use the nesting selector (&)",
    },
    messages: {
      missingNestingOperator:
        "Nesting selector missing.\nDid you forget the &?",
    },
    fixable: "code",
    hasSuggestions: true,
    schema: [],
  },
  defaultOptions: [],
  create: (context) => {
    const { importedNames, ImportDeclaration } = importsNextYak();
    return {
      ImportDeclaration,
      /** All return statements in styled/css literals */
      TaggedTemplateExpression(node: TSESTree.TaggedTemplateExpression) {
        if (
          importedNames.styled === undefined &&
          importedNames.css === undefined
        ) {
          return;
        }

        const templateLiteral = node.quasi;

        if (
          !templateLiteral ||
          templateLiteral.type !== AST_NODE_TYPES.TemplateLiteral ||
          // No next-yak imports
          (importedNames.styled === undefined &&
            importedNames.css === undefined) ||
          // Not a styled or css tag
          !isStyledOrCssTag(node, importedNames) ||
          // As we check the full code of a template literal (including nested literals),
          // Don't check nested template literals as we check the full content of a template literal.
          hasParentTaggedTemplateExpression(node)
        ) {
          return;
        }

        // Returns the raw code of the template literal `...`
        const codeRaw = context.sourceCode.getText(templateLiteral);
        if (!codeRaw) {
          return;
        }

        // Replace all content inside parentheses with underscores to avoid matching unrelated selectors
        // e.g. :not(:disabled, :active):focused -> :not(_______):focused
        // https://regex101.com/r/ik69ze/1
        const code = codeRaw.replace(
          /\(([^()]+)\)/g,
          (_match, capturedGroup) => {
            const underscoreReplacement = "_".repeat(capturedGroup.length);
            return `(${underscoreReplacement})`;
          },
        );

        // Regex to find all possible elements to check
        // https://regex101.com/r/nNIxaX/1
        // Group 0: The full match
        // Group 1: The selector
        const possibleElements =
          /(?<=[,\n])[^:,\n\S]*(?:^|\s)((?:>|\+|~)|:[^\s,{]+)[^,{\n]*(?=[,{])/gm;

        let match;
        while ((match = possibleElements.exec(code)) !== null) {
          // If & operator is already present -> ok
          // Do we need to check for whitespaces around it?
          if (match[0].includes("&")) {
            continue;
          }

          // False positives -> ok
          if (
            match[1] === ":root" ||
            match[1].startsWith(":global(") ||
            match[1] === ":modal"
          ) {
            continue;
          }

          // Nested selectors already have a reference -> ok
          if (isNestedSelector(code, match)) {
            continue;
          }

          // Check if element is first in match so we can provide a fix
          const elementIsFirstInMatch = match[0].trim().startsWith(match[1]);

          let fixFn = undefined;
          if (elementIsFirstInMatch) {
            const selectorStartIndex =
              templateLiteral.range[0] +
              match.index +
              match[0].indexOf(match[1]);

            let fixSnippet = "&";
            if (match[1] === ">" || match[1] === "+" || match[1] === "~") {
              fixSnippet = "& ";
            }

            fixFn = (fixer: RuleFixer) =>
              fixer.insertTextBeforeRange(
                // End location doesn't matter, just take +1 of the start location
                [selectorStartIndex, selectorStartIndex + 1],
                fixSnippet,
              );
          }

          // Get the location of the trimmed match in the code for highlighting in the IDE
          const matchTrimmed = match[0].trim();
          const loc = mapRegexMatchToLoc(code, match, matchTrimmed);

          context.report({
            node: templateLiteral,
            messageId: "missingNestingOperator",

            // The location within the template literal needs to be adjusted to the location in the file
            loc: {
              start: {
                line: templateLiteral.loc.start.line + loc.start.line - 1,
                // If on first line, add start column of templateLiteral. Not possible with prettier.
                column: loc.start.column,
              },
              end: {
                line: templateLiteral.loc.start.line + loc.end.line - 1,
                // If on first line, add start column of templateLiteral. Not possible with prettier.
                column: loc.end.column,
              },
            },

            // If a fix is possible, suggest it
            suggest: fixFn && [
              {
                messageId: "missingNestingOperator",
                fix: fixFn,
              },
            ],
          });
        }
      },
    };
  },
});

/**
 * Checks, if the parent expression is a tagged template expression, up to maxLevels up.
 */
function hasParentTaggedTemplateExpression(node: TSESTree.Node, maxLevels = 5) {
  let currentLevel = 1;
  let currentNode: TSESTree.Node | undefined = node.parent;

  while (currentNode && currentLevel < maxLevels) {
    if (currentNode.type === AST_NODE_TYPES.TaggedTemplateExpression) {
      return true;
    }

    currentNode = currentNode.parent;
    currentLevel++;
  }

  return false;
}

/**
 * Checks if a character is a valid identifier character.
 */
function isValidIdentifierChar(char: string) {
  const identifierRegex = /^[a-zA-Z_$]+$/;
  return identifierRegex.test(char);
}

/**
 * Checks if a selector is nested in a selector, taking into account comments and nested template literals.
 *
 * It also has a basic check for expressions containing simple identifiers used for selectors
 * e.g. ${Selector} {} -> valid nesting, ${myQuery.mobile} {} -> not valid nesting
 */
function isNestedSelector(sourceCode: string, regexMatch: RegExpMatchArray) {
  if (regexMatch.index === undefined) {
    return false;
  }

  const groupStartIndex = regexMatch.index;

  let nestingLevel = 0;

  // State is true if any relevant nesting is detected
  const nestingLevelState: boolean[] = [false];
  let inComment = false;

  let withinExpressionOnSameLine = false;
  let invalidExpressionSelectorOnSameLine = false;

  for (let i = 0; i < sourceCode.length; i++) {
    const char = sourceCode[i];

    if (i === groupStartIndex) {
      return nestingLevelState.some((state) => state);
    }

    // Detect comments
    if (char === "/" && sourceCode[i + 1] === "*") {
      inComment = true;
    } else if (char === "*" && sourceCode[i + 1] === "/") {
      inComment = false;
    }

    if (!inComment) {
      // Detect nested expressions
      if (char === "{") {
        if (sourceCode[i - 1] === "$") {
          // Expressions do not count as nesting
          nestingLevelState[++nestingLevel] = false;
          withinExpressionOnSameLine = true;
        } else {
          nestingLevelState[++nestingLevel] =
            !invalidExpressionSelectorOnSameLine;
        }
      } else if (char === "}") {
        nestingLevelState.pop();
        withinExpressionOnSameLine = false;
      } else if (char === "\n") {
        withinExpressionOnSameLine = false;
        invalidExpressionSelectorOnSameLine = false;
      } else {
        if (withinExpressionOnSameLine) {
          if (!isValidIdentifierChar(char)) {
            invalidExpressionSelectorOnSameLine = true;
          }
        }
      }
    }
  }
}

/**
 * Maps a regex match to a location in the provided source code.
 */
function mapRegexMatchToLoc(
  sourceCode: string,
  regexMatch: RegExpMatchArray,
  matchText: string,
) {
  let line = 1;
  let column = 0;

  const loc = {
    start: { line, column },
    end: { line, column },
  };

  if (regexMatch.index === undefined) {
    return loc;
  }

  const groupStartIndex =
    regexMatch.index + Math.max(regexMatch[0].indexOf(matchText), 0);
  const groupEndIndex = groupStartIndex + matchText.length;

  for (let i = 0; i < sourceCode.length; i++) {
    const char = sourceCode[i];

    if (i === groupStartIndex) {
      loc.start = { line, column };
    }

    if (i === groupEndIndex) {
      loc.end = { line, column };
    }

    if (char === "\n") {
      line++;
      column = 0;
    } else {
      column++;
    }
  }

  return loc;
}
