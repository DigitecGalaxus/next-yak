import { parse } from "@babel/parser";
import type { Expression, ObjectExpression, TSAsExpression } from "@babel/types";
import {
  ModuleExport,
  ModuleExports,
  UnsupportedExportSource,
} from "../../cross-file-resolver/parseModule.js";
import { yakPackageNames } from "../../packageNames.js";

/**
 * Extracts a module's exports for the cross-file resolver by parsing with babel. Nothing is executed.
 *
 * Handles `export const`, export lists (`export { x }`), re-exports with a `from`,
 * `export *`, and `export default`.
 * Anything else becomes an `unsupported` entry with its source location, or is skipped.
 *
 * Throws if the source doesn't parse.
 */
export async function parseExports(sourceContents: string): Promise<ModuleExports> {
  try {
    const ast = parse(sourceContents, {
      sourceType: "module",
      plugins: ["jsx", "typescript"] as const,
    });

    // Derive importYak from top-level imports (no traverse needed)
    const importYak = ast.program.body.some(
      (node) =>
        node.type === "ImportDeclaration" &&
        (yakPackageNames as readonly string[]).includes(node.source.value),
    );

    const moduleExports: ModuleExports = {
      importYak,
      named: {},
      all: [],
    };

    // Track variable declarations for default export lookup
    const variableDeclarations: Record<string, Expression> = {};
    // Track top-level import bindings so exported imports become re-exports
    const importBindings: Record<string, ModuleExport> = {};
    // Local export lists (`export { x }`), resolved after the loop
    // because the list can come before the declaration
    const localExportSpecifiers: { local: string; exported: string }[] = [];
    let defaultIdentifier: string | null = null;

    for (const node of ast.program.body) {
      if (node.type === "ImportDeclaration") {
        for (const specifier of node.specifiers) {
          if (specifier.type === "ImportSpecifier") {
            importBindings[specifier.local.name] = {
              type: "re-export",
              from: node.source.value,
              name:
                specifier.imported.type === "Identifier"
                  ? specifier.imported.name
                  : specifier.imported.value,
            };
          } else if (specifier.type === "ImportDefaultSpecifier") {
            importBindings[specifier.local.name] = {
              type: "re-export",
              from: node.source.value,
              name: "default",
            };
          } else if (specifier.type === "ImportNamespaceSpecifier") {
            importBindings[specifier.local.name] = {
              type: "namespace-re-export",
              from: node.source.value,
            };
          }
        }
      }

      // Track top-level variable declarations for default export lookup
      if (node.type === "VariableDeclaration") {
        for (const decl of node.declarations) {
          if (decl.id.type === "Identifier" && decl.init) {
            variableDeclarations[decl.id.name] = decl.init;
          }
        }
      }

      if (node.type === "ExportNamedDeclaration") {
        if (node.source) {
          // export { x } from "./file", export { x as y } from "./file"
          for (const specifier of node.specifiers) {
            if (
              specifier.type === "ExportSpecifier" &&
              specifier.exported.type === "Identifier" &&
              specifier.local.type === "Identifier"
            ) {
              moduleExports.named[specifier.exported.name] = {
                type: "re-export",
                from: node.source.value,
                name: specifier.local.name,
              };
            }
            // export * as ns from "./file"
            if (
              specifier.type === "ExportNamespaceSpecifier" &&
              specifier.exported.type === "Identifier"
            ) {
              moduleExports.named[specifier.exported.name] = {
                type: "namespace-re-export",
                from: node.source.value,
              };
            }
          }
        } else if (!node.declaration) {
          // export { x }, export { x as y }
          for (const specifier of node.specifiers) {
            if (
              specifier.type === "ExportSpecifier" &&
              specifier.exported.type === "Identifier" &&
              specifier.local.type === "Identifier"
            ) {
              localExportSpecifiers.push({
                local: specifier.local.name,
                exported: specifier.exported.name,
              });
            }
          }
        } else if (node.declaration.type === "VariableDeclaration") {
          // export const x = ...
          for (const declaration of node.declaration.declarations) {
            if (declaration.id.type === "Identifier" && declaration.init) {
              variableDeclarations[declaration.id.name] = declaration.init;
              const parsed = parseExportValueExpression(declaration.init, sourceContents);
              if (parsed) {
                moduleExports.named[declaration.id.name] = parsed;
              }
            }
          }
        }
      }

      if (node.type === "ExportDefaultDeclaration") {
        if (node.declaration.type === "Identifier") {
          // e.g. export default variableName;
          // Save the identifier name to look up later
          defaultIdentifier = node.declaration.name;
        } else if (
          node.declaration.type === "FunctionDeclaration" ||
          node.declaration.type === "ClassDeclaration"
        ) {
          // e.g. export default function() {...} or export default class {...}
          moduleExports.named["default"] = {
            type: "unsupported",
            hint: node.declaration.type,
            source: extractUnsupportedSource(node.declaration.loc, sourceContents),
          };
        } else {
          // e.g. export default { ... } or export default "value"
          moduleExports.named["default"] = parseExportValueExpression(
            node.declaration as Expression,
            sourceContents,
          );
        }
      }

      // export * from "./file"
      if (node.type === "ExportAllDeclaration") {
        moduleExports.all.push(node.source.value);
      }
    }

    // Look up the value of an exported identifier from local declarations or imports
    const resolveIdentifier = (name: string): ModuleExport | undefined => {
      if (variableDeclarations[name]) {
        return parseExportValueExpression(variableDeclarations[name], sourceContents);
      }
      return importBindings[name];
    };

    for (const { local, exported } of localExportSpecifiers) {
      const resolved = resolveIdentifier(local);
      if (resolved) {
        moduleExports.named[exported] = resolved;
      }
    }

    // If we found a default export that's an identifier, look up its value
    if (defaultIdentifier) {
      const resolved = resolveIdentifier(defaultIdentifier);
      if (resolved) {
        moduleExports.named["default"] = resolved;
      }
    }

    return moduleExports;
  } catch (error) {
    throw new Error(`Error parsing exports: ${(error as Error).message}`);
  }
}

/**
 * Unpacks TS type assertions (as, satisfies) to the underlying expression
 */
function unpackTSAsExpression(node: TSAsExpression | Expression): Expression {
  if (node.type === "TSAsExpression" || node.type === "TSSatisfiesExpression") {
    return unpackTSAsExpression((node as TSAsExpression).expression);
  }
  return node;
}

function parseExportValueExpression(node: Expression, code?: string): ModuleExport {
  // ignores `as` casts so it doesn't interfere with the ast node type detection
  const expression = unpackTSAsExpression(node);
  if (expression.type === "CallExpression" || expression.type === "TaggedTemplateExpression") {
    return { type: "tag-template" };
  } else if (expression.type === "StringLiteral" || expression.type === "NumericLiteral") {
    return { type: "constant", value: expression.value };
  } else if (
    expression.type === "UnaryExpression" &&
    expression.operator === "-" &&
    expression.argument.type === "NumericLiteral"
  ) {
    return { type: "constant", value: -expression.argument.value };
  } else if (expression.type === "TemplateLiteral" && expression.quasis.length === 1) {
    return { type: "constant", value: expression.quasis[0].value.raw };
  } else if (expression.type === "ObjectExpression") {
    return {
      type: "record",
      value: parseObjectExpression(expression, code),
    };
  }
  return {
    type: "unsupported",
    hint: expression.type,
    source: extractUnsupportedSource(expression.loc, code),
  };
}

function parseObjectExpression(
  node: ObjectExpression,
  code?: string,
): Record<string, ModuleExport> {
  let result: Record<string, ModuleExport> = {};
  for (const property of node.properties) {
    if (property.type === "ObjectProperty" && property.key.type === "Identifier") {
      const key = property.key.name;
      const parsed = parseExportValueExpression(property.value as Expression, code);
      if (parsed) {
        result[key] = parsed;
      }
    }
  }
  return result;
}

/**
 * Pull the structural source-location data the error formatter needs to
 * render a snippet — the formatter (not this parser) is responsible for
 * any presentation. Returns undefined if loc or source text is missing.
 */
function extractUnsupportedSource(
  loc:
    | {
        start: { line: number; column: number };
        end: { line: number; column: number };
      }
    | null
    | undefined,
  code: string | undefined,
): UnsupportedExportSource | undefined {
  if (!loc || !code) return undefined;
  const lineText = code.split(/\r?\n/)[loc.start.line - 1];
  if (lineText === undefined) return undefined;
  return {
    start: { line: loc.start.line, column: loc.start.column },
    end: { line: loc.end.line, column: loc.end.column },
    lineText,
  };
}
