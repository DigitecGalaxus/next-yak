import { parseModule, generateCode, builders } from "magicast";

const DEFAULT_CONFIG = `import { withYak } from "next-yak/withYak";

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withYak(nextConfig);
`;

/**
 * Transforms a Next.js config file to add withYak wrapper.
 * Returns null if no config file exists (caller should create one).
 */
export function transformNextConfig(code: string): string {
  const mod = parseModule(code);

  // Add import for withYak
  mod.imports.$prepend({
    from: "next-yak/withYak",
    imported: "withYak",
    local: "withYak",
  });

  // Wrap the default export with withYak()
  // We need to work at the AST level to handle all patterns
  const ast = mod.$ast;
  let wrapped = false;

  for (const node of ast.body) {
    // ESM: export default <expression>
    if (node.type === "ExportDefaultDeclaration") {
      node.declaration = {
        type: "CallExpression",
        callee: { type: "Identifier", name: "withYak" },
        arguments: [node.declaration],
        optional: false,
      } as any;
      wrapped = true;
      break;
    }

    // CJS: module.exports = <expression>
    if (
      node.type === "ExpressionStatement" &&
      node.expression.type === "AssignmentExpression" &&
      node.expression.left.type === "MemberExpression" &&
      node.expression.left.object.type === "Identifier" &&
      node.expression.left.object.name === "module" &&
      node.expression.left.property.type === "Identifier" &&
      node.expression.left.property.name === "exports"
    ) {
      node.expression.right = {
        type: "CallExpression",
        callee: { type: "Identifier", name: "withYak" },
        arguments: [node.expression.right],
        optional: false,
      } as any;

      // For CJS, replace the import with a require
      delete mod.imports.withYak;
      // Insert require at the top of the file
      const requireStatement = {
        type: "VariableDeclaration",
        declarations: [
          {
            type: "VariableDeclarator",
            id: {
              type: "ObjectPattern",
              properties: [
                {
                  type: "ObjectProperty",
                  key: { type: "Identifier", name: "withYak" },
                  value: { type: "Identifier", name: "withYak" },
                  shorthand: true,
                  computed: false,
                },
              ],
            },
            init: {
              type: "CallExpression",
              callee: { type: "Identifier", name: "require" },
              arguments: [
                { type: "StringLiteral", value: "next-yak/withYak" },
              ],
              optional: false,
            },
          },
        ],
        kind: "const",
      } as any;

      // Find insertion point (after existing requires or at top)
      let insertIndex = 0;
      for (let i = 0; i < ast.body.length; i++) {
        const n = ast.body[i];
        if (
          n.type === "VariableDeclaration" &&
          n.declarations[0]?.init?.type === "CallExpression" &&
          n.declarations[0].init.callee?.name === "require"
        ) {
          insertIndex = i + 1;
        }
      }
      ast.body.splice(insertIndex, 0, requireStatement);
      wrapped = true;
      break;
    }
  }

  if (!wrapped) {
    throw new Error(
      "Could not find default export in Next.js config file. Please add next-yak manually."
    );
  }

  return generateCode(mod).code;
}

export function getDefaultNextConfig(): string {
  return DEFAULT_CONFIG;
}
