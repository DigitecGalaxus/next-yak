import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils.js";
import { importsNextYak, ImportedNames } from "./utils.js";

/** Visits a node and all of its descendants */
const walk = (node: TSESTree.Node, visit: (node: TSESTree.Node) => void) => {
  visit(node);
  for (const key of Object.keys(node)) {
    if (key === "parent") {
      continue;
    }
    const value = node[key as keyof TSESTree.Node] as unknown;
    for (const child of Array.isArray(value) ? value : [value]) {
      if (child && typeof (child as TSESTree.Node).type === "string") {
        walk(child as TSESTree.Node, visit);
      }
    }
  }
};

/**
 * Whether the compiler may inline the expression into several style conditions
 * without changing what the code does: it has to be free of side effects and
 * evaluate to the same value during one render
 */
const isSafeToInline = (node: TSESTree.Node): boolean => {
  switch (node.type) {
    case AST_NODE_TYPES.Literal:
    case AST_NODE_TYPES.Identifier:
      return true;
    case AST_NODE_TYPES.MemberExpression:
      return (
        (!node.computed || node.property.type === AST_NODE_TYPES.Literal) &&
        isSafeToInline(node.object)
      );
    case AST_NODE_TYPES.UnaryExpression:
      return node.operator !== "delete" && isSafeToInline(node.argument);
    default:
      return false;
  }
};

/**
 * The runtime passes more than the plain attributes to the style conditions, so
 * reading one of these keeps every usage of the component on the runtime path
 */
const isRuntimeInjectedProp = (name: string) =>
  name === "theme" ||
  name === "children" ||
  name === "className" ||
  name === "style" ||
  name === "key";

/**
 * Only `styled.div`, `styled("div")` and `styled(Component)` are inlined - an
 * `.attrs()` chain has none of these shapes as its tag is a call on a member
 * expression
 */
const foldableTag = (tag: TSESTree.Node, importedNames: ImportedNames) => {
  if (tag.type === AST_NODE_TYPES.MemberExpression) {
    return tag.object.type === AST_NODE_TYPES.Identifier && tag.object.name === importedNames.styled
      ? "native"
      : false;
  }
  if (tag.type === AST_NODE_TYPES.CallExpression) {
    if (tag.callee.type !== AST_NODE_TYPES.Identifier || tag.callee.name !== importedNames.styled) {
      return false;
    }
    const [arg] = tag.arguments;
    return arg?.type === AST_NODE_TYPES.Identifier ? "component" : "native";
  }
  return false;
};

const isCssLiteral = (node: TSESTree.Node, importedNames: ImportedNames) =>
  node.type === AST_NODE_TYPES.TaggedTemplateExpression &&
  node.tag.type === AST_NODE_TYPES.Identifier &&
  node.tag.name === importedNames.css;

/**
 * Only `cond && css`...`` and `cond ? css`...` : css`...`` are inlined as a
 * toggleable class. Anything else, e.g. a value compiled into a css variable,
 * keeps every usage of the component on the runtime path
 */
const isClassToggle = (body: TSESTree.Node, importedNames: ImportedNames) => {
  if (body.type === AST_NODE_TYPES.LogicalExpression) {
    return body.operator === "&&" && isCssLiteral(body.right, importedNames);
  }
  if (body.type === AST_NODE_TYPES.ConditionalExpression) {
    return (
      isCssLiteral(body.consequent, importedNames) && isCssLiteral(body.alternate, importedNames)
    );
  }
  return false;
};

/** The single `return <expr>;` a block bodied style condition may hold */
const singleReturnArgument = (block: TSESTree.BlockStatement) => {
  const [statement] = block.body;
  return block.body.length === 1 &&
    statement?.type === AST_NODE_TYPES.ReturnStatement &&
    statement.argument
    ? statement.argument
    : null;
};

/**
 * The params and the condition body of a style interpolation, for the shapes
 * the compiler inlines: an arrow or a function expression, with an expression
 * body or a body holding a single return
 */
const styleCondition = (node: TSESTree.Expression) => {
  if (
    node.type !== AST_NODE_TYPES.ArrowFunctionExpression &&
    node.type !== AST_NODE_TYPES.FunctionExpression
  ) {
    return null;
  }
  if (node.async || node.generator) {
    return "bails" as const;
  }
  const body =
    node.body.type === AST_NODE_TYPES.BlockStatement ? singleReturnArgument(node.body) : node.body;
  return body ? { params: node.params, body } : ("bails" as const);
};

/** An identifier naming a prop rather than reading it, e.g. `x.$size` */
const isNameOnly = (node: TSESTree.Identifier) => {
  const parent = node.parent;
  if (parent?.type === AST_NODE_TYPES.MemberExpression) {
    return parent.property === node && !parent.computed;
  }
  if (parent?.type === AST_NODE_TYPES.Property) {
    return parent.key === node && !parent.computed;
  }
  return false;
};

/**
 * How often one style condition reads each prop, or `null` if the condition
 * keeps every usage of the component on the runtime path
 *
 * Every read is inlined separately, so a condition reading a prop twice
 * (`$size && $size === "big"`) evaluates its value twice on its own
 */
const propReadsIn = (
  params: TSESTree.Parameter[],
  body: TSESTree.Expression,
): Map<string, number> | null => {
  const reads = new Map<string, number>();
  const count = (name: string) => reads.set(name, (reads.get(name) ?? 0) + 1);
  // e.g. `${() => darkMode && css`...`}` - references the outer scope only
  if (params.length === 0) {
    return reads;
  }
  if (params.length > 1) {
    return null;
  }
  const [param] = params;
  if (param.type === AST_NODE_TYPES.ObjectPattern) {
    const props = new Set<string>();
    for (const property of param.properties) {
      // only plain destructuring - renames, defaults and rest bail
      if (
        property.type !== AST_NODE_TYPES.Property ||
        !property.shorthand ||
        property.value.type !== AST_NODE_TYPES.Identifier ||
        property.key.type !== AST_NODE_TYPES.Identifier ||
        isRuntimeInjectedProp(property.key.name)
      ) {
        return null;
      }
      props.add(property.key.name);
    }
    walk(body, (node) => {
      if (node.type === AST_NODE_TYPES.Identifier && !isNameOnly(node) && props.has(node.name)) {
        count(node.name);
      }
    });
    return reads;
  }
  if (param.type === AST_NODE_TYPES.Identifier) {
    let bails = false;
    walk(body, (node) => {
      if (
        node.type === AST_NODE_TYPES.MemberExpression &&
        !node.computed &&
        node.object.type === AST_NODE_TYPES.Identifier &&
        node.object.name === param.name &&
        node.property.type === AST_NODE_TYPES.Identifier
      ) {
        if (isRuntimeInjectedProp(node.property.name)) {
          bails = true;
        }
        count(node.property.name);
      }
    });
    return bails ? null : reads;
  }
  return null;
};

/** A spread or a theme prop keeps the usage on the runtime path */
const keepsRuntimePath = (attribute: TSESTree.JSXAttribute | TSESTree.JSXSpreadAttribute) =>
  attribute.type === AST_NODE_TYPES.JSXSpreadAttribute ||
  (attribute.name.type === AST_NODE_TYPES.JSXIdentifier &&
    (attribute.name.name === "theme" || attribute.name.name === "css"));

const isTopLevelConst = (declarator: TSESTree.VariableDeclarator) => {
  const declaration = declarator.parent;
  if (declaration?.type !== AST_NODE_TYPES.VariableDeclaration || declaration.kind !== "const") {
    return false;
  }
  const parent = declaration.parent;
  return (
    parent?.type === AST_NODE_TYPES.Program ||
    parent?.type === AST_NODE_TYPES.ExportNamedDeclaration
  );
};

export const precomputeStylePropValues = createRule({
  name: "precompute-style-prop-values",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforces that prop values read by several style conditions are computed once and passed as a variable",
      recommended: true,
      requiresTypeChecking: false,
    },
    messages: {
      precompute:
        "`{{value}}` is evaluated {{count}} times: next-yak inlines this component and copies the value of `{{prop}}` into every style condition that reads it{{onElement}}.\nIf the expression is not pure, the copies can disagree and produce styles the component could never render.\nCompute it once and pass the result:\n\n  const {{suggestion}} = {{value}};\n  <{{component}} {{prop}}={{{suggestion}}} />",
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => {
    const { importedNames, ImportDeclaration } = importsNextYak();
    /** Style condition read counts per prop, `null` for components which never fold */
    const components = new Map<string, Map<string, number> | null>();
    const usages: TSESTree.JSXOpeningElement[] = [];

    return {
      ImportDeclaration,
      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        if (
          node.id.type !== AST_NODE_TYPES.Identifier ||
          node.init?.type !== AST_NODE_TYPES.TaggedTemplateExpression
        ) {
          return;
        }
        const tag = foldableTag(node.init.tag, importedNames);
        if (!tag || !isTopLevelConst(node)) {
          components.set(node.id.name, null);
          return;
        }
        const reads = new Map<string, number>();
        for (const expression of node.init.quasi.expressions) {
          const condition = styleCondition(expression);
          // a non function interpolation is a build time constant and does not
          // stop the component from being inlined
          if (condition === null) {
            continue;
          }
          if (condition === "bails" || !isClassToggle(condition.body, importedNames)) {
            components.set(node.id.name, null);
            return;
          }
          const conditionReads = propReadsIn(condition.params, condition.body);
          if (!conditionReads) {
            components.set(node.id.name, null);
            return;
          }
          for (const [name, count] of conditionReads) {
            reads.set(name, (reads.get(name) ?? 0) + count);
          }
        }
        // a styled(Component) with style conditions keeps the runtime path, as
        // the $prop forwarding depends on the wrapped component
        components.set(node.id.name, tag === "component" && reads.size > 0 ? null : reads);
      },
      JSXOpeningElement(node: TSESTree.JSXOpeningElement) {
        usages.push(node);
      },
      "Program:exit"() {
        for (const usage of usages) {
          if (usage.name.type !== AST_NODE_TYPES.JSXIdentifier) {
            continue;
          }
          const reads = components.get(usage.name.name);
          if (!reads || usage.attributes.some(keepsRuntimePath)) {
            continue;
          }
          for (const attribute of usage.attributes) {
            if (
              attribute.type !== AST_NODE_TYPES.JSXAttribute ||
              attribute.name.type !== AST_NODE_TYPES.JSXIdentifier ||
              attribute.value?.type !== AST_NODE_TYPES.JSXExpressionContainer ||
              attribute.value.expression.type === AST_NODE_TYPES.JSXEmptyExpression
            ) {
              continue;
            }
            const prop = attribute.name.name;
            const conditions = reads.get(prop) ?? 0;
            if (conditions === 0) {
              continue;
            }
            // a $prop is dropped from the element, so a single read just moves
            // it - every other prop is evaluated on the element as well
            const onElement = !prop.startsWith("$");
            const count = conditions + (onElement ? 1 : 0);
            const value = attribute.value.expression;
            if (count < 2 || isSafeToInline(value)) {
              continue;
            }
            context.report({
              node: value,
              messageId: "precompute",
              data: {
                value: context.sourceCode.getText(value),
                count,
                prop,
                component: usage.name.name,
                suggestion: prop.replace(/^\$/, "") || "value",
                onElement: onElement ? ", and keeps it on the element as well" : "",
              },
            });
          }
        }
      },
    };
  },
});
