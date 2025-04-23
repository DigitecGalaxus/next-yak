// index.ts
import fs from "node:fs";

// rules/cssNestingOperator.ts
import { AST_NODE_TYPES as AST_NODE_TYPES2 } from "@typescript-eslint/utils";

// utils.ts
import { ESLintUtils } from "@typescript-eslint/utils";
var createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/DigitecGalaxus/next-yak/packages/eslint-plugin/docs/rules/${name}.md`
);

// rules/utils.ts
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
var importsNextYak = () => {
  const importedNames = {};
  return {
    importedNames,
    ImportDeclaration(node) {
      if (node.source.value === "next-yak") {
        node.specifiers.forEach((specifier) => {
          if (specifier.type === AST_NODE_TYPES.ImportSpecifier && specifier.imported.type === AST_NODE_TYPES.Identifier) {
            if (specifier.imported.name === "styled") {
              importedNames.styled = specifier.local.name;
            } else if (specifier.imported.name === "css") {
              importedNames.css = specifier.local.name;
            }
          }
        });
      }
    }
  };
};
function isStyledOrCssTag(node, importedNames) {
  if (node.type !== AST_NODE_TYPES.TaggedTemplateExpression) {
    return false;
  }
  const { tag } = node;
  if (tag.type === AST_NODE_TYPES.Identifier && (tag.name === importedNames.styled || tag.name === importedNames.css)) {
    return "css";
  }
  if (tag.type === AST_NODE_TYPES.MemberExpression) {
    return tag.object.type === AST_NODE_TYPES.Identifier && tag.object.name === importedNames.styled ? "styled" : false;
  }
  if (tag.type === AST_NODE_TYPES.CallExpression) {
    if (tag.callee.type === AST_NODE_TYPES.MemberExpression) {
      const callee = tag.callee;
      if (callee.property.type === AST_NODE_TYPES.Identifier && callee.property.name === "attrs") {
        const memberExpression = callee.property.parent;
        if (memberExpression.object.type === AST_NODE_TYPES.CallExpression) {
          const callExpression = memberExpression.object;
          return callExpression.callee.type === AST_NODE_TYPES.Identifier && callExpression.callee.name === importedNames.styled ? "styled" : false;
        } else if (memberExpression.object.type === AST_NODE_TYPES.MemberExpression) {
          const memberExpressionObject = memberExpression.object;
          return memberExpressionObject.object.type === AST_NODE_TYPES.Identifier && memberExpressionObject.object.name === importedNames.styled ? "styled" : false;
        }
      }
    }
    return tag.callee.type === AST_NODE_TYPES.Identifier && tag.callee.name === importedNames.styled ? "styled" : false;
  }
  return false;
}

// rules/cssNestingOperator.ts
var cssNestingOperator = createRule({
  name: "css-nesting-operator",
  meta: {
    type: "problem",
    docs: {
      description: "Enforces css selectors in next-yak to correctly use the nesting selector (&)"
    },
    messages: {
      missingNestingOperator: "Nesting selector missing.\nDid you forget the &?"
    },
    // fixable: "code",
    hasSuggestions: true,
    schema: []
  },
  defaultOptions: [],
  create: (context) => {
    const { importedNames, ImportDeclaration } = importsNextYak();
    return {
      ImportDeclaration,
      /** All return statements in styled/css literals */
      TaggedTemplateExpression(node) {
        if (importedNames.styled === void 0 && importedNames.css === void 0) {
          return;
        }
        const templateLiteral = node.quasi;
        if (!templateLiteral || templateLiteral.type !== AST_NODE_TYPES2.TemplateLiteral || // No next-yak imports
        importedNames.styled === void 0 && importedNames.css === void 0 || // Not a styled or css tag
        !isStyledOrCssTag(node, importedNames) || // As we check the full code of a template literal (including nested literals),
        // Don't check nested template literals as we check the full content of a template literal.
        hasParentTaggedTemplateExpression(node)) {
          return;
        }
        const codeRaw = context.sourceCode.getText(templateLiteral);
        if (!codeRaw) {
          return;
        }
        const code = codeRaw.replace(
          /\(([^()]+)\)/g,
          (_match, capturedGroup) => {
            const underscoreReplacement = "_".repeat(capturedGroup.length);
            return `(${underscoreReplacement})`;
          }
        );
        const possibleElements = /(?<=[,\n])[^:,\n\S]*(?:^|\s)((?:>|\+|~)|:[^\s,{]+)[^,{\n]*(?=[,{])/gm;
        let match;
        while ((match = possibleElements.exec(code)) !== null) {
          if (match[0].includes("&")) {
            continue;
          }
          if (match[1] === ":root" || match[1].startsWith(":global(") || match[1] === ":modal") {
            continue;
          }
          if (isNestedSelector(code, match)) {
            continue;
          }
          const elementIsFirstInMatch = match[0].trim().startsWith(match[1]);
          let fixFn = void 0;
          if (elementIsFirstInMatch) {
            const selectorStartIndex = templateLiteral.range[0] + match.index + match[0].indexOf(match[1]);
            let fixSnippet = "&";
            if (match[1] === ">" || match[1] === "+" || match[1] === "~") {
              fixSnippet = "& ";
            }
            fixFn = (fixer) => fixer.insertTextBeforeRange(
              // End location doesn't matter, just take +1 of the start location
              [selectorStartIndex, selectorStartIndex + 1],
              fixSnippet
            );
          }
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
                column: loc.start.column
              },
              end: {
                line: templateLiteral.loc.start.line + loc.end.line - 1,
                // If on first line, add start column of templateLiteral. Not possible with prettier.
                column: loc.end.column
              }
            },
            // If a fix is possible, suggest it
            suggest: fixFn && [
              {
                messageId: "missingNestingOperator",
                fix: fixFn
              }
            ]
          });
        }
      }
    };
  }
});
function hasParentTaggedTemplateExpression(node, maxLevels = 5) {
  let currentLevel = 1;
  let currentNode = node.parent;
  while (currentNode && currentLevel < maxLevels) {
    if (currentNode.type === AST_NODE_TYPES2.TaggedTemplateExpression) {
      return true;
    }
    currentNode = currentNode.parent;
    currentLevel++;
  }
  return false;
}
function isValidIdentifierChar(char) {
  const identifierRegex = /^[a-zA-Z_$]+$/;
  return identifierRegex.test(char);
}
function isNestedSelector(sourceCode, regexMatch) {
  if (regexMatch.index === void 0) {
    return false;
  }
  const groupStartIndex = regexMatch.index;
  let nestingLevel = 0;
  const nestingLevelState = [false];
  let inComment = false;
  let withinExpressionOnSameLine = false;
  let invalidExpressionSelectorOnSameLine = false;
  for (let i = 0; i < sourceCode.length; i++) {
    const char = sourceCode[i];
    if (i === groupStartIndex) {
      return nestingLevelState.some((state) => state);
    }
    if (char === "/" && sourceCode[i + 1] === "*") {
      inComment = true;
    } else if (char === "*" && sourceCode[i + 1] === "/") {
      inComment = false;
    }
    if (!inComment) {
      if (char === "{") {
        if (sourceCode[i - 1] === "$") {
          nestingLevelState[++nestingLevel] = false;
          withinExpressionOnSameLine = true;
        } else {
          nestingLevelState[++nestingLevel] = !invalidExpressionSelectorOnSameLine;
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
function mapRegexMatchToLoc(sourceCode, regexMatch, matchText) {
  let line = 1;
  let column = 0;
  const loc = {
    start: { line, column },
    end: { line, column }
  };
  if (regexMatch.index === void 0) {
    return loc;
  }
  const groupStartIndex = regexMatch.index + Math.max(regexMatch[0].indexOf(matchText), 0);
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

// rules/enforceSemicolon.ts
import { AST_NODE_TYPES as AST_NODE_TYPES3 } from "@typescript-eslint/utils";
var enforceSemicolons = createRule({
  name: "enforce-semicolons",
  meta: {
    type: "problem",
    docs: {
      description: "Enforces that expression in styled/css literals from next-yak use semicolons"
    },
    messages: {
      lonelyExpression: "Expressions must have a selector, an opening bracket or semicolon in the same line\nDid you forget a semicolon?"
    },
    fixable: "code",
    schema: []
  },
  defaultOptions: [],
  create: (context) => {
    const { importedNames, ImportDeclaration } = importsNextYak();
    return {
      ImportDeclaration,
      TaggedTemplateExpression(node) {
        if (importedNames.styled === void 0 && importedNames.css === void 0) {
          return;
        }
        const templateLiteral = node.quasi;
        if (!templateLiteral || !isStyledOrCssTag(node, importedNames)) {
          return;
        }
        if (templateLiteral.type !== AST_NODE_TYPES3.TemplateLiteral) {
          throw new Error("Unexpected AST - bug in yakEnforceSemicolons");
        }
        templateLiteral.expressions.forEach((expression, index) => {
          if (expression.type !== AST_NODE_TYPES3.Identifier && expression.type !== AST_NODE_TYPES3.MemberExpression) {
            return;
          }
          const codeBefore = getQuasiValue(templateLiteral.quasis[index]);
          const codeAfter = getQuasiValue(templateLiteral.quasis[index + 1]);
          const codeBeforeIsWhitespaceOnly = !codeBefore.trim();
          const isFirstExpression = codeBeforeIsWhitespaceOnly && index === 0;
          const isAloneInLine = (isFirstExpression || codeBefore.match(/\n\s*$/)) && (!codeAfter || codeAfter.match(/^\s*\n/));
          if (!isAloneInLine) {
            return;
          }
          const previousExpressionType = templateLiteral.expressions[index - 1]?.type;
          const previousExpressionIsTerminating = previousExpressionType === AST_NODE_TYPES3.ArrowFunctionExpression || previousExpressionType === AST_NODE_TYPES3.ConditionalExpression || previousExpressionType === AST_NODE_TYPES3.LogicalExpression;
          if (isFirstExpression || previousExpressionIsTerminating && codeBeforeIsWhitespaceOnly || codeBefore.match(/[;{}]\s*$/)) {
            context.report({
              node: expression,
              messageId: "lonelyExpression",
              fix: (fixer) => {
                return fixer.insertTextAfterRange(
                  [expression.range[0], expression.range[1] + 1],
                  ";"
                );
              }
            });
          }
        });
      }
    };
  }
});
function getQuasiValue(quasi) {
  if (!quasi) {
    return "";
  }
  return quasi.value.cooked;
}

// rules/styleConditions.ts
import { AST_NODE_TYPES as AST_NODE_TYPES4 } from "@typescript-eslint/utils";
var styleConditions = createRule({
  name: "style-conditions",
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforces that arrow functions only return runtime values or css literals in styled/css literals from next-yak",
      recommended: true,
      requiresTypeChecking: true
    },
    messages: {
      invalidRuntimeReturnValue: "When possible arrow functions in styled/css literals from next-yak should return css literals (css`...`) instead of inline values. CSS literals create a CSS class, which is better for performance.",
      invalidCssReturnValue: "CSS literals can not be converted into a css variable - try to move the css property also into the arrow function or remove the css``"
    },
    schema: []
  },
  defaultOptions: [],
  create: (context) => {
    const { importedNames, ImportDeclaration } = importsNextYak();
    return {
      ImportDeclaration,
      TaggedTemplateExpression(node) {
        if (importedNames.styled === void 0 && importedNames.css === void 0) {
          return;
        }
        if (!node.parent || isStyledOrCssTag(node, importedNames) !== "css") {
          return;
        }
        const { tag, needle } = findClosestStyledOrCssTag(
          node.parent,
          importedNames
        );
        if (!tag) {
          return;
        }
        const index = tag.quasi.expressions.findIndex(
          (expr) => expr === needle
        );
        if (index === -1) {
          return;
        }
        const codeBefore = tag.quasi.quasis[index].value.raw;
        const isDeclaration = codeBefore.trim().endsWith(":");
        if (!isDeclaration) {
          return;
        }
        context.report({
          node,
          messageId: "invalidCssReturnValue"
        });
      },
      /** All return statements in styled/css literals */
      "TaggedTemplateExpression :matches(ArrowFunctionExpression, ReturnStatement)"(node) {
        const { tag, params } = findClosestStyledOrCssTag(node, importedNames);
        if (!tag) {
          return;
        }
        const returnValue = node.type === AST_NODE_TYPES4.ReturnStatement ? node.argument : node.body.type !== AST_NODE_TYPES4.BlockStatement ? node.body : void 0;
        if (returnValue && !isNodeAccessingParams(returnValue, params, importedNames)) {
          context.report({
            node: returnValue,
            messageId: "invalidRuntimeReturnValue"
          });
        }
      }
    };
  }
});
function findClosestStyledOrCssTag(node, importedNames) {
  let current = node;
  let params = [];
  let needle = node;
  while (current) {
    if (current.type === AST_NODE_TYPES4.ArrowFunctionExpression) {
      params = current.params;
    } else {
      const type = isStyledOrCssTag(current, importedNames);
      if (type && current.type === AST_NODE_TYPES4.TaggedTemplateExpression) {
        return { tag: current, needle, params, type };
      }
    }
    if (current.type !== AST_NODE_TYPES4.TemplateLiteral) {
      needle = current;
    }
    current = current.parent;
  }
  return { tag: void 0, needle, type: void 0, params };
}
function isCssLiteral(node, importedNames) {
  return node.type === AST_NODE_TYPES4.TaggedTemplateExpression && node.tag.type === AST_NODE_TYPES4.Identifier && node.tag.name === importedNames.css;
}
function isValidIdentifier(node, params) {
  if (node.type === AST_NODE_TYPES4.Identifier) {
    return params.some((param) => {
      if (param.type === AST_NODE_TYPES4.Identifier) {
        return param.name === node.name;
      }
      if (param.type === AST_NODE_TYPES4.ObjectPattern) {
        return param.properties.some(
          (prop) => prop.type === AST_NODE_TYPES4.Property && prop.key.type === AST_NODE_TYPES4.Identifier && prop.key.name === node.name
        );
      }
      return false;
    });
  }
  if (node.type === AST_NODE_TYPES4.MemberExpression) {
    return isValidIdentifier(node.object, params);
  }
  return false;
}
function isFalsyLiteral(node) {
  return node.type === AST_NODE_TYPES4.Literal && (node.value === null || node.value === false || node.value === 0 || node.value === "") || node.type === AST_NODE_TYPES4.Identifier && (node.name === "undefined" || node.name === "null");
}
function isNodeAccessingParams(node, params, importedNames) {
  switch (node.type) {
    case AST_NODE_TYPES4.Literal:
      return false;
    case AST_NODE_TYPES4.TemplateLiteral:
      return node.expressions.length > 0 && node.expressions.some(
        (expr) => isNodeAccessingParams(expr, params, importedNames)
      );
    case AST_NODE_TYPES4.Identifier:
      return isValidIdentifier(node, params);
    case AST_NODE_TYPES4.MemberExpression:
      return isValidIdentifier(node, params);
    case AST_NODE_TYPES4.TaggedTemplateExpression:
      return isCssLiteral(node, importedNames);
    case AST_NODE_TYPES4.LogicalExpression:
      if (node.operator === "&&" && isValidTestExpression(node.left)) {
        return isNodeAccessingParams(node.right, params, importedNames);
      }
      return isNodeAccessingParams(node.left, params, importedNames) && isNodeAccessingParams(node.right, params, importedNames);
    case AST_NODE_TYPES4.ConditionalExpression:
      return isValidTestExpression(node.test) && (isNodeAccessingParams(node.consequent, params, importedNames) || isNodeAccessingParams(node.alternate, params, importedNames));
    case AST_NODE_TYPES4.BinaryExpression:
      return isNodeAccessingParams(node.left, params, importedNames) || isNodeAccessingParams(node.right, params, importedNames);
    case AST_NODE_TYPES4.UnaryExpression:
      if (node.operator === "!") {
        return isNodeAccessingParams(node.argument, params, importedNames);
      }
      return false;
    default:
      return isFalsyLiteral(node);
  }
}
function isValidTestExpression(node) {
  switch (node.type) {
    // true or false
    case AST_NODE_TYPES4.Literal:
      return node.value === true || node.value === false;
    // x
    case AST_NODE_TYPES4.Identifier:
      return true;
    // x.isLarge
    case AST_NODE_TYPES4.MemberExpression:
      return true;
    // !x
    case AST_NODE_TYPES4.UnaryExpression:
      return true;
    // test(x)
    case AST_NODE_TYPES4.CallExpression:
      return true;
    // x === 4
    case AST_NODE_TYPES4.LogicalExpression:
      return true;
    // x > 4
    case AST_NODE_TYPES4.BinaryExpression:
      return true;
    default:
      return false;
  }
}

// index.ts
var pkg = JSON.parse(
  fs.readFileSync(new URL("./package.json", import.meta.url), "utf8")
);
var plugin = {
  meta: {
    name: pkg.name,
    version: pkg.version
  },
  configs: {},
  rules: {
    "css-nesting-operator": cssNestingOperator,
    "enforce-semicolon": enforceSemicolons,
    "style-conditions": styleConditions
  },
  processors: {}
};
Object.assign(plugin.configs, {
  recommended: {
    plugins: {
      [pkg.name]: plugin
    },
    rules: {
      [`${pkg.name}/css-nesting-operator`]: "error",
      [`${pkg.name}/enforce-semicolon`]: "error",
      [`${pkg.name}/style-conditions`]: "suggestion"
    }
  }
});
var index_default = plugin;
export {
  index_default as default
};
//# sourceMappingURL=index.js.map