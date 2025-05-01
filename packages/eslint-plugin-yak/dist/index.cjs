"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.ts
var index_exports = {};
__export(index_exports, {
  configs: () => configs,
  default: () => index_default,
  meta: () => meta,
  name: () => name,
  processors: () => processors,
  rules: () => rules,
  version: () => version
});
module.exports = __toCommonJS(index_exports);

// package.json
var package_default = {
  name: "eslint-plugin-yak",
  version: "0.0.1",
  description: "Eslint plugin for next-yak",
  homepage: "https://yak.js.org/",
  type: "module",
  repository: {
    type: "git",
    url: "https://github.com/DigitecGalaxus/next-yak"
  },
  bugs: {
    url: "https://github.com/DigitecGalaxus/next-yak/issues"
  },
  license: "MIT",
  keywords: [
    "eslint",
    "eslintplugin",
    "eslint-plugin",
    "css-in-js",
    "styled-components",
    "react",
    "typescript"
  ],
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      require: "./dist/index.cjs",
      import: "./dist/index.js"
    }
  },
  main: "./dist/index.cjs",
  module: "./dist/index.js",
  types: "./dist/index.d.ts",
  sideEffects: false,
  scripts: {
    build: "tsup --format esm,cjs --clean",
    test: "vitest",
    "update:docs": "pnpm build && eslint-doc-generator"
  },
  files: [
    "."
  ],
  dependencies: {
    "@typescript-eslint/utils": "catalog:dev"
  },
  devDependencies: {
    "@types/node": "catalog:dev",
    "@typescript-eslint/rule-tester": "catalog:dev",
    "eslint-doc-generator": "catalog:dev",
    tsup: "catalog:dev",
    typescript: "catalog:dev",
    vitest: "catalog:dev"
  },
  peerDependencies: {
    "@typescript-eslint/parser": ">8.0.0",
    eslint: ">=9.0.0",
    typescript: ">=5.0.0"
  },
  publishConfig: {
    access: "public"
  },
  maintainers: [
    {
      name: "Luca Schneider"
    }
  ],
  author: {
    name: "Jan Nicklas"
  }
};

// rules/cssNestingOperator.ts
var import_utils3 = require("@typescript-eslint/utils");

// utils.ts
var import_utils = require("@typescript-eslint/utils");
var createRule = import_utils.ESLintUtils.RuleCreator(
  (name2) => `https://github.com/DigitecGalaxus/next-yak/packages/eslint-plugin/docs/rules/${name2}.md`
);

// rules/utils.ts
var import_utils2 = require("@typescript-eslint/utils");
var importsNextYak = () => {
  const importedNames = {};
  return {
    importedNames,
    ImportDeclaration(node) {
      if (node.source.value === "next-yak") {
        node.specifiers.forEach((specifier) => {
          if (specifier.type === import_utils2.AST_NODE_TYPES.ImportSpecifier && specifier.imported.type === import_utils2.AST_NODE_TYPES.Identifier) {
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
  if (node.type !== import_utils2.AST_NODE_TYPES.TaggedTemplateExpression) {
    return false;
  }
  const { tag } = node;
  if (tag.type === import_utils2.AST_NODE_TYPES.Identifier && (tag.name === importedNames.styled || tag.name === importedNames.css)) {
    return "css";
  }
  if (tag.type === import_utils2.AST_NODE_TYPES.MemberExpression) {
    return tag.object.type === import_utils2.AST_NODE_TYPES.Identifier && tag.object.name === importedNames.styled ? "styled" : false;
  }
  if (tag.type === import_utils2.AST_NODE_TYPES.CallExpression) {
    if (tag.callee.type === import_utils2.AST_NODE_TYPES.MemberExpression) {
      const callee = tag.callee;
      if (callee.property.type === import_utils2.AST_NODE_TYPES.Identifier && callee.property.name === "attrs") {
        const memberExpression = callee.property.parent;
        if (memberExpression.object.type === import_utils2.AST_NODE_TYPES.CallExpression) {
          const callExpression = memberExpression.object;
          return callExpression.callee.type === import_utils2.AST_NODE_TYPES.Identifier && callExpression.callee.name === importedNames.styled ? "styled" : false;
        } else if (memberExpression.object.type === import_utils2.AST_NODE_TYPES.MemberExpression) {
          const memberExpressionObject = memberExpression.object;
          return memberExpressionObject.object.type === import_utils2.AST_NODE_TYPES.Identifier && memberExpressionObject.object.name === importedNames.styled ? "styled" : false;
        }
      }
    }
    return tag.callee.type === import_utils2.AST_NODE_TYPES.Identifier && tag.callee.name === importedNames.styled ? "styled" : false;
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
        if (!templateLiteral || templateLiteral.type !== import_utils3.AST_NODE_TYPES.TemplateLiteral || // No next-yak imports
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
    if (currentNode.type === import_utils3.AST_NODE_TYPES.TaggedTemplateExpression) {
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
var import_utils6 = require("@typescript-eslint/utils");
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
        if (templateLiteral.type !== import_utils6.AST_NODE_TYPES.TemplateLiteral) {
          throw new Error("Unexpected AST - bug in yakEnforceSemicolons");
        }
        templateLiteral.expressions.forEach((expression, index) => {
          if (expression.type !== import_utils6.AST_NODE_TYPES.Identifier && expression.type !== import_utils6.AST_NODE_TYPES.MemberExpression) {
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
          const previousExpressionIsTerminating = previousExpressionType === import_utils6.AST_NODE_TYPES.ArrowFunctionExpression || previousExpressionType === import_utils6.AST_NODE_TYPES.ConditionalExpression || previousExpressionType === import_utils6.AST_NODE_TYPES.LogicalExpression;
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
var import_utils9 = require("@typescript-eslint/utils");
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
        if (isInsideAttrsMethod(node)) {
          return;
        }
        const { tag, params } = findClosestStyledOrCssTag(node, importedNames);
        if (!tag) {
          return;
        }
        const returnValue = node.type === import_utils9.AST_NODE_TYPES.ReturnStatement ? node.argument : node.body.type !== import_utils9.AST_NODE_TYPES.BlockStatement ? node.body : void 0;
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
    if (current.type === import_utils9.AST_NODE_TYPES.ArrowFunctionExpression) {
      params = current.params;
    } else {
      const type = isStyledOrCssTag(current, importedNames);
      if (type && current.type === import_utils9.AST_NODE_TYPES.TaggedTemplateExpression) {
        return { tag: current, needle, params, type };
      }
    }
    if (current.type !== import_utils9.AST_NODE_TYPES.TemplateLiteral) {
      needle = current;
    }
    current = current.parent;
  }
  return { tag: void 0, needle, type: void 0, params };
}
function isCssLiteral(node, importedNames) {
  return node.type === import_utils9.AST_NODE_TYPES.TaggedTemplateExpression && node.tag.type === import_utils9.AST_NODE_TYPES.Identifier && node.tag.name === importedNames.css;
}
function isValidIdentifier(node, params) {
  if (node.type === import_utils9.AST_NODE_TYPES.Identifier) {
    return params.some((param) => {
      if (param.type === import_utils9.AST_NODE_TYPES.Identifier) {
        return param.name === node.name;
      }
      if (param.type === import_utils9.AST_NODE_TYPES.ObjectPattern) {
        return param.properties.some(
          (prop) => prop.type === import_utils9.AST_NODE_TYPES.Property && prop.key.type === import_utils9.AST_NODE_TYPES.Identifier && prop.key.name === node.name
        );
      }
      return false;
    });
  }
  if (node.type === import_utils9.AST_NODE_TYPES.MemberExpression) {
    return isValidIdentifier(node.object, params);
  }
  return false;
}
function isFalsyLiteral(node) {
  return node.type === import_utils9.AST_NODE_TYPES.Literal && (node.value === null || node.value === false || node.value === 0 || node.value === "") || node.type === import_utils9.AST_NODE_TYPES.Identifier && (node.name === "undefined" || node.name === "null");
}
function isNodeAccessingParams(node, params, importedNames) {
  switch (node.type) {
    case import_utils9.AST_NODE_TYPES.Literal:
      return false;
    case import_utils9.AST_NODE_TYPES.TemplateLiteral:
      return node.expressions.length > 0 && node.expressions.some(
        (expr) => isNodeAccessingParams(expr, params, importedNames)
      );
    case import_utils9.AST_NODE_TYPES.Identifier:
      return isValidIdentifier(node, params);
    case import_utils9.AST_NODE_TYPES.MemberExpression:
      return isValidIdentifier(node, params);
    case import_utils9.AST_NODE_TYPES.TaggedTemplateExpression:
      return isCssLiteral(node, importedNames);
    case import_utils9.AST_NODE_TYPES.LogicalExpression:
      if (node.operator === "&&" && isValidTestExpression(node.left)) {
        return isNodeAccessingParams(node.right, params, importedNames);
      }
      return isNodeAccessingParams(node.left, params, importedNames) && isNodeAccessingParams(node.right, params, importedNames);
    case import_utils9.AST_NODE_TYPES.ConditionalExpression:
      return isValidTestExpression(node.test) && (isNodeAccessingParams(node.consequent, params, importedNames) || isNodeAccessingParams(node.alternate, params, importedNames));
    case import_utils9.AST_NODE_TYPES.BinaryExpression:
      return isNodeAccessingParams(node.left, params, importedNames) || isNodeAccessingParams(node.right, params, importedNames);
    case import_utils9.AST_NODE_TYPES.UnaryExpression:
      return isNodeAccessingParams(node.argument, params, importedNames);
    default:
      return isFalsyLiteral(node);
  }
}
function isValidTestExpression(node) {
  switch (node.type) {
    // true or false
    case import_utils9.AST_NODE_TYPES.Literal:
      return node.value === true || node.value === false;
    // x
    case import_utils9.AST_NODE_TYPES.Identifier:
      return true;
    // x.isLarge
    case import_utils9.AST_NODE_TYPES.MemberExpression:
      return true;
    // !x
    case import_utils9.AST_NODE_TYPES.UnaryExpression:
      return true;
    // test(x)
    case import_utils9.AST_NODE_TYPES.CallExpression:
      return true;
    // x === 4
    case import_utils9.AST_NODE_TYPES.LogicalExpression:
      return true;
    // x > 4
    case import_utils9.AST_NODE_TYPES.BinaryExpression:
      return true;
    default:
      return false;
  }
}
function isInsideAttrsMethod(node) {
  let current = node;
  while (current && current.parent) {
    if (current.parent.type === import_utils9.AST_NODE_TYPES.CallExpression) {
      const callExpr = current.parent;
      if (callExpr.callee.type === import_utils9.AST_NODE_TYPES.MemberExpression) {
        const memberExpr = callExpr.callee;
        if (memberExpr.property.type === import_utils9.AST_NODE_TYPES.Identifier && memberExpr.property.name === "attrs") {
          return true;
        }
      }
    }
    current = current.parent;
  }
  return false;
}

// index.ts
var plugin = {
  meta: {
    name: package_default.name,
    version: package_default.version
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
      [package_default.name]: plugin
    },
    rules: {
      [`${package_default.name}/css-nesting-operator`]: "error",
      [`${package_default.name}/enforce-semicolon`]: "error",
      [`${package_default.name}/style-conditions`]: "warn"
    }
  }
});
var rules = plugin.rules;
var configs = plugin.configs;
var processors = plugin.processors;
var meta = plugin.meta;
var name = plugin.meta.name;
var version = plugin.meta.version;
var index_default = plugin;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  configs,
  meta,
  name,
  processors,
  rules,
  version
});
//# sourceMappingURL=index.cjs.map