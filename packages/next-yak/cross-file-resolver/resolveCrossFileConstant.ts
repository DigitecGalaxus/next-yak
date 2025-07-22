import type {
  ConstantExport,
  ModuleExport,
  ParsedModule,
  RecordExport,
  TagTemplateExport,
} from "./parseModule.js";
import { Cache } from "./types.js";
import * as crypto from "node:crypto";
import { CauseError, CircularDependencyError, ResolveError } from "./Errors.js";

const yakCssImportRegex =
  // Make mixin and selector non optional once we dropped support for the babel plugin
  /--yak-css-import\:\s*url\("([^"]+)",?(|mixin|selector)\)(;?)/g;

/**
 * Resolves cross-file selectors in css files
 *
 * e.g.:
 * theme.ts:
 * ```ts
 * export const colors = {
 *   primary: "#ff0000",
 *   secondary: "#00ff00",
 * };
 * ```
 *
 * styles.ts:
 * ```ts
 * import { colors } from "./theme";
 * export const button = css`
 *  background-color: ${colors.primary};
 * `;
 */
export async function resolveCrossFileConstant(
  context: ResolveContext,
  filePath: string,
  css: string,
): Promise<{ resolved: string; dependencies: string[] }> {
  if (context.cache?.resolveCrossFileConstant === undefined) {
    return uncachedResolveCrossFileConstant(context, filePath, css);
  }

  const cacheKey = crypto
    .createHash("sha1")
    .update(filePath)
    .update(css)
    .digest("hex");

  const cached = context.cache.resolveCrossFileConstant.get(cacheKey);

  if (cached === undefined) {
    const resolvedCrossFilConstantPromise = uncachedResolveCrossFileConstant(
      context,
      filePath,
      css,
    );
    context.cache.resolveCrossFileConstant.set(
      filePath,
      resolvedCrossFilConstantPromise,
    );

    if (context.cache.resolveCrossFileConstant.addDependency) {
      context.cache.resolveCrossFileConstant.addDependency(filePath, filePath);
      resolvedCrossFilConstantPromise.then((value) => {
        for (const dep of value.dependencies) {
          context.cache!.resolveCrossFileConstant!.addDependency!(
            filePath,
            dep,
          );
        }
      });
    }

    return resolvedCrossFilConstantPromise;
  }

  return cached;
}

export async function uncachedResolveCrossFileConstant(
  context: ResolveContext,
  filePath: string,
  css: string,
): Promise<{ resolved: string; dependencies: string[] }> {
  const yakImports = await parseYakCssImport(context, filePath, css);

  if (yakImports.length === 0) {
    return { resolved: css, dependencies: [] };
  }

  try {
    const dependencies = new Set<string>();

    const resolvedValues = await Promise.all(
      yakImports.map(async ({ moduleSpecifier, specifier }) => {
        const { resolved: resolvedModule } = await resolveModule(
          context,
          moduleSpecifier,
        );

        const resolvedValue = await resolveModuleSpecifierRecursively(
          context,
          resolvedModule,
          specifier,
        );

        for (const dependency of resolvedValue.from) {
          dependencies.add(dependency);
        }

        return resolvedValue;
      }),
    );

    // Replace the imports with the resolved values
    let result = css;
    for (let i = yakImports.length - 1; i >= 0; i--) {
      const { position, size, importKind, specifier, semicolon } =
        yakImports[i];
      const resolved = resolvedValues[i];

      if (importKind === "selector") {
        if (
          resolved.type !== "styled-component" &&
          resolved.type !== "constant"
        ) {
          throw new Error(
            `Found "${
              resolved.type
            }" but expected a selector - did you forget a semicolon after "${specifier.join(
              ".",
            )}"?`,
          );
        }
      }

      const replacement =
        resolved.type === "styled-component"
          ? resolved.value
          : resolved.value +
            // resolved.value can be of two different types:
            // - mixin:
            //   ${mixinName};
            // - constant:
            //   color: ${value};
            // For mixins the semicolon is already included in the value
            // but for constants it has to be added manually
            (["}", ";"].includes(String(resolved.value).trimEnd().slice(-1))
              ? ""
              : semicolon);

      result =
        result.slice(0, position) +
        String(replacement) +
        result.slice(position + size);
    }

    return { resolved: result, dependencies: Array.from(dependencies) };
  } catch (error) {
    throw new CauseError(
      `Error while resolving cross-file selectors in file "${filePath}"`,
      { cause: error },
    );
  }
}

/**
 * Search for --yak-css-import: url("path/to/module") in the css
 */
async function parseYakCssImport(
  context: ResolveContext,
  filePath: string,
  css: string,
): Promise<YakCssImport[]> {
  const yakImports: YakCssImport[] = [];

  for (const match of css.matchAll(yakCssImportRegex)) {
    const [fullMatch, encodedArguments, importKind, semicolon] = match;
    const [moduleSpecifier, ...specifier] = encodedArguments
      .split(":")
      .map((entry) => decodeURIComponent(entry));

    yakImports.push({
      encodedArguments,
      moduleSpecifier: await context.resolve(moduleSpecifier, filePath),
      specifier,
      importKind: importKind as YakImportKind,
      semicolon,
      position: match.index,
      size: fullMatch.length,
    });
  }

  return yakImports;
}

async function resolveModule(context: ResolveContext, filePath: string) {
  if (context.cache?.resolve === undefined) {
    return uncachedResolveModule(context, filePath);
  }

  const cached = context.cache.resolve.get(filePath);
  if (cached === undefined) {
    const resolvedPromise = uncachedResolveModule(context, filePath);
    context.cache.resolve.set(filePath, resolvedPromise);

    if (context.cache.resolve.addDependency) {
      context.cache.resolve.addDependency(filePath, filePath);
      resolvedPromise.then((value) => {
        for (const dep of value.dependencies) {
          context.cache!.resolve!.addDependency!(filePath, dep);
        }
      });
    }

    return resolvedPromise;
  }

  return cached;
}

async function uncachedResolveModule(
  context: ResolveContext,
  filePath: string,
): Promise<{ resolved: ResolvedModule; dependencies: string[] }> {
  const parsedModule = await context.parse(filePath);

    const exports = parsedModule.exports as ResolvedExports;

  if (parsedModule.type !== "regular") {
    return {
      resolved: {
        path: parsedModule.path,
        exports,
      },
      dependencies: [],
    };
  }


  const dependencies = new Set<string>();

  // Reconcile styled-component "name" structure with export structure
  if (parsedModule.styledComponents) {
    Object.values(parsedModule.styledComponents).map((styledComponent) => {
      if (styledComponent.nameParts.length === 1) {
        exports.named[styledComponent.nameParts[0]] = {
          type: "styled-component",
          className: styledComponent.value,
        };
      } else {
        let exportEntry = exports.named[styledComponent.nameParts[0]];

        if (!exportEntry) {
          exportEntry = { type: "record", value: {} };
          exports.named[styledComponent.nameParts[0]] = exportEntry;
        } else if (exportEntry.type !== "record") {
          throw new CauseError(`Error parsing file "${parsedModule.path}"`, {
            cause: `"${styledComponent.nameParts[0]}" is not a record`,
          });
        }

        let current = exportEntry.value;
        for (let i = 1; i < styledComponent.nameParts.length - 1; i++) {
          let next = current[styledComponent.nameParts[i]];
          if (!next) {
            next = { type: "record", value: {} };
            current[styledComponent.nameParts[i]] = next;
          } else if (next.type !== "record") {
            throw new CauseError(`Error parsing file "${parsedModule.path}"`, {
              cause: `"${styledComponent.nameParts.slice(0, i + 1).join(".")}" is not a record`,
            });
          }
          current = next.value;
        }
        current[
          styledComponent.nameParts[styledComponent.nameParts.length - 1]
        ] = {
          type: "styled-component",
          className: styledComponent.value,
        };
      }
    });
  }

  // Recursively resolve cross-file constants in mixins
  // e.g. cross file mixins inside a cross file mixin
  // or a cross file selector inside a cross file mixin
  if (parsedModule.mixins) {
    await Promise.all(
      Object.values(parsedModule.mixins).map(async (mixin) => {
        const { resolved, dependencies: deps } = await resolveCrossFileConstant(
          context,
          parsedModule.path,
          mixin.value,
        );

        for (const dep of deps) {
          dependencies.add(dep);
        }

        if (mixin.nameParts.length === 1) {
          exports.named[mixin.nameParts[0]] = {
            type: "mixin",
            value: resolved,
          };
        } else {
          let exportEntry = exports.named[mixin.nameParts[0]];

          if (!exportEntry) {
            exportEntry = { type: "record", value: {} };
            exports.named[mixin.nameParts[0]] = exportEntry;
          } else if (exportEntry.type !== "record") {
            throw new CauseError(`Error parsing file "${parsedModule.path}"`, {
              cause: `"${mixin.nameParts[0]}" is not a record`,
            });
          }

          let current = exportEntry.value;
          for (let i = 1; i < mixin.nameParts.length - 1; i++) {
            let next = current[mixin.nameParts[i]];
            if (!next) {
              next = { type: "record", value: {} };
              current[mixin.nameParts[i]] = next;
            } else if (next.type !== "record") {
              throw new CauseError(
                `Error parsing file "${parsedModule.path}"`,
                {
                  cause: `"${mixin.nameParts.slice(0, i + 1).join(".")}" is not a record`,
                },
              );
            }
            current = next.value;
          }
          current[mixin.nameParts[mixin.nameParts.length - 1]] = {
            type: "mixin",
            value: resolved,
          };
        }
      }),
    );
  }
  return {
    resolved: {
      path: parsedModule.path,
      exports,
    },
    dependencies: Array.from(dependencies),
  };
}

type ResolvedCssImport =
  | {
      type: "styled-component";
      source: string;
      from: string[];
      name: string;
      value: string | undefined;
    }
  | { type: "mixin"; source: string; from: string[]; value: string | number }
  | {
      type: "constant";
      source: string;
      from: string[];
      value: string | number;
    };

async function resolveModuleSpecifierRecursively(
  context: ResolveContext,
  resolvedModule: ResolvedModule,
  specifiers: string[],
  seen = new Set<string>(),
): Promise<ResolvedCssImport> {
  const exportName = specifiers[0];
  const exportValue = resolvedModule.exports.named[exportName];
  if (exportValue !== undefined) {
    if (seen.has(resolvedModule.path+':' + exportName)) {
      throw new CircularDependencyError(
        `Unable to resolve "${specifiers.join(".")}" in module "${
          resolvedModule.path
        }"`,
        { cause: "Circular dependency detected" },
      );
    }

    seen.add(resolvedModule.path+':' + exportName);
    return resolveModuleExport(
      context,
      resolvedModule.path,
      exportValue,
      specifiers,
      seen,
    );
  }

  let i = 1;
  for (const from of resolvedModule.exports.all) {
    if (context.exportAllLimit && i++ > context.exportAllLimit) {
      throw new ResolveError(
        `Unable to resolve "${specifiers.join(".")}" in module "${
          resolvedModule.path
        }"`,
        {
          cause: `More than ${context.exportAllLimit} star exports are not supported for performance reasons`,
        },
      );
    }

    try {
      const resolved = await resolveModuleExport(
        context,
        resolvedModule.path,
        {
          type: "re-export",
          from,
          name: exportName,
        },
        specifiers,
        seen,
      );

      if (seen.has(resolvedModule.path+':*')) {
        throw new CircularDependencyError(
          `Unable to resolve "${specifiers.join(".")}" in module "${
            resolvedModule.path
          }"`,
          { cause: "Circular dependency detected" },
        );
      }

      seen.add(resolvedModule.path+':*');

      return resolved
    } catch (error) {
      // ignore resolve error, it means the specifier was not found in the
      // current module, we just have to continue the loop.
      if (!(error instanceof ResolveError)) {
        throw error;
      }
      // if the cause of the error is a circular dependency down the road do not
      // ignore the error
      if (error.circular) {
        throw error;
      }
    }
  }

  throw new ResolveError(`Unable to resolve "${specifiers.join(".")}"`, {
    cause: `no matching export found in module "${resolvedModule.path}"`,
  });
}

async function resolveModuleExport(
  context: ResolveContext,
  filePath: string,
  moduleExport: ResolvedExport,
  specifiers: string[],
  seen: Set<string>,
): Promise<ResolvedCssImport> {
  try {
    switch (moduleExport.type) {
      case "re-export": {
        const { resolved: reExportedModule } = await resolveModule(
          context,
          await context.resolve(moduleExport.from, filePath),
        );
        const resolved = await resolveModuleSpecifierRecursively(
          context,
          reExportedModule,
          [moduleExport.name, ...specifiers.slice(1)],
          seen,
        );
        if (resolved) {
          resolved.from.push(filePath);
        }
        return resolved;
      }
      case "namespace-re-export": {
        const { resolved: reExportedModule } = await resolveModule(
          context,
          await context.resolve(moduleExport.from, filePath),
        );
        const resolved = await resolveModuleSpecifierRecursively(
          context,
          reExportedModule,
          specifiers.slice(1),
          seen,
        );
        if (resolved) {
          resolved.from.push(filePath);
        }
        return resolved;
      }
      case "styled-component": {
        return {
          type: "styled-component",
          from: [filePath],
          source: filePath,
          name: specifiers[specifiers.length - 1],
          value: moduleExport.className,
        };
      }
      case "constant": {
        return {
          type: "constant",
          from: [filePath],
          source: filePath,
          value: moduleExport.value,
        };
      }
      case "record": {
        const resolvedInRecord = resolveSpecifierInRecord(
          moduleExport,
          specifiers[0],
          specifiers.slice(1),
        );
        return resolveModuleExport(
          context,
          filePath,
          resolvedInRecord,
          specifiers,
          seen,
        );
      }
      case "mixin": {
        return {
          type: "mixin",
          from: [filePath],
          source: filePath,
          value: moduleExport.value,
        };
      }
    }
  } catch (error) {
    throw new ResolveError(
      `Unable to resolve "${specifiers.join(".")}" in module "${filePath}"`,
      { cause: error },
    );
  }

  throw new ResolveError(
    `Unable to resolve "${specifiers.join(".")}" in module "${filePath}"`,
    { cause: `unknown type "${moduleExport.type}"` },
  );
}

function resolveSpecifierInRecord(
  record: ExtendedRecordExport,
  name: string,
  specifiers: string[],
): ConstantExport | ResolvedStyledComponent | ResolvedMixin {
  if (specifiers.length === 0) {
    throw new ResolveError("did not expect an object");
  }
  let depth = 0;
  let current: ResolvedExport = record;
  while (current && current.type === "record" && depth < specifiers.length) {
    current = current.value[specifiers[depth]];
    depth += 1;
  }

  if (current === undefined || depth !== specifiers.length) {
    throw new ResolveError(
      `Unable to resolve "${specifiers.join(".")}" in object/array "${name}"`, { cause:"path not found" },
    );
  }

  if (
    current.type === "constant" ||
    current.type === "styled-component" ||
    current.type === "mixin"
  ) {
    return current;
  }

  // mixins in .yak files are wrapped inside an object with a __yak key
  if (current.type === "record" && '__yak' in current.value && current.value.__yak.type === "constant") {
    return { type: "mixin", value: String(current.value.__yak.value) };
  }

  throw new ResolveError(
    `Unable to resolve "${specifiers.join(".")}" in object/array "${name}"`, { cause: "only string and numbers are supported" },
  );
}

export type ResolveContext = {
  parse: (modulePath: string) => Promise<ParsedModule> | ParsedModule;
  cache?: {
    resolve?: Cache<
      Promise<{ resolved: ResolvedModule; dependencies: string[] }>
    >;
    resolveCrossFileConstant?: Cache<
      Promise<{ resolved: string; dependencies: string[] }>
    >;
  };
  exportAllLimit?: number;
  resolve: (specifier: string, importer: string) => Promise<string> | string;
};

type YakImportKind = "mixin" | "selector";

type YakCssImport = {
  encodedArguments: string;
  moduleSpecifier: string;
  specifier: string[];
  importKind: YakImportKind;
  semicolon: string;
  position: number;
  size: number;
};

export type ExtendedRecordExport = {
  type: "record";
  value: Record<string, ResolvedExport>;
};

export type ResolvedMixin = { type: "mixin"; value: string };
export type ResolvedStyledComponent = {
  type: "styled-component";
  className: string;
};

export type ResolvedExport =
  | Exclude<ModuleExport, RecordExport | TagTemplateExport>
  | ExtendedRecordExport
  | ResolvedStyledComponent
  | ResolvedMixin;

export type ResolvedExports = {
  named: Record<string, ResolvedExport>;
  all: string[];
};

export type ResolvedModule = {
  path: string;
  exports: ResolvedExports;
} 
