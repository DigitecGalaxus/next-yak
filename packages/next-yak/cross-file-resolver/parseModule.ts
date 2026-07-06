import { type Cache } from "./types.js";

export async function parseModule(
  context: ParseContext,
  modulePath: string,
): Promise<ParsedModule> {
  try {
    const isYak =
      modulePath.endsWith(".yak.ts") ||
      modulePath.endsWith(".yak.tsx") ||
      modulePath.endsWith(".yak.js") ||
      modulePath.endsWith(".yak.jsx");

    // handle yak file by evaluating and mapping exported value to the
    // `ModuleExport` format. This operation is not cached to always get a fresh
    // value from those modules
    if (isYak && context.evaluateYakModule) {
      const yakModule = await context.evaluateYakModule(modulePath);
      const yakExports = objectToModuleExport(yakModule);

      return {
        type: "yak",
        exports: { importYak: false, named: yakExports, all: [] },
        path: modulePath,
      };
    }

    if (context.cache?.parse === undefined) {
      return await uncachedParseModule(context, modulePath);
    }

    const cached = context.cache.parse.get(modulePath);
    if (cached === undefined) {
      // We cache the parsed file to avoid re-parsing it.
      // It's ok, that initial parallel requests to the same file will parse it multiple times.
      // This avoid deadlocks do to the fact that we load multiple modules in the chain for cross file references.
      const parsedModule = await uncachedParseModule(context, modulePath);

      context.cache.parse.set(modulePath, parsedModule);
      if (context.cache.parse.addDependency) {
        context.cache.parse.addDependency(modulePath, modulePath);
      }
      return parsedModule;
    }

    return cached;
  } catch (error) {
    const causeMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error parsing file "${modulePath}"\n  Caused by: ${causeMessage}`);
  }
}

export async function uncachedParseModule(
  context: ParseContext,
  modulePath: string,
): Promise<ParsedModule> {
  const exports = await context.extractExports(modulePath);

  // early exit if no yak import was found
  if (!exports.importYak) {
    return {
      type: "regular",
      path: modulePath,
      exports,
    };
  }

  const transformed = await context.getTransformed(modulePath);
  const mixins = parseMixins(transformed.code);
  const styledComponents = parseStyledComponents(transformed.code, context.transpilationMode);

  return {
    type: "regular",
    path: modulePath,
    js: transformed,
    exports,
    styledComponents,
    mixins,
  };
}

function parseMixins(sourceContents: string): Record<string, Mixin> {
  // Static mixins are always in the following format:
  // /*YAK EXPORTED MIXIN:fancy:aspectRatio:16:9
  // css
  // */
  //
  // Dynamic mixins (mixins with conditional branches and/or css variables)
  // use a V2 marker - their css payload keeps the branch structure inside
  // `@yak-branch bN { ... }` blocks which are rendered per usage site:
  // /*YAK EXPORTED MIXIN V2:highlight
  // color: black;
  // @yak-branch b0 {
  //   color: red;
  // }
  // */
  //
  // The markers are disjoint: splitting on "YAK EXPORTED MIXIN:" never
  // matches a V2 comment and vice versa
  return {
    ...parseMixinComments(sourceContents, "/*YAK EXPORTED MIXIN:", false),
    ...parseMixinComments(sourceContents, "/*YAK EXPORTED MIXIN V2:", true),
  };
}

function parseMixinComments(
  sourceContents: string,
  marker: string,
  dynamic: boolean,
): Record<string, Mixin> {
  const mixinParts = sourceContents.split(marker);
  let mixins: Record<string, Mixin> = {};

  for (let i = 1; i < mixinParts.length; i++) {
    const [comment] = mixinParts[i].split("*/", 1);
    const position = comment.indexOf("\n");
    const name = comment.slice(0, position);
    const value = comment.slice(position + 1);
    mixins[name] = {
      type: "mixin",
      value,
      nameParts: name.split(":").map((part) => decodeURIComponent(part)),
      ...(dynamic ? { dynamic } : {}),
    };
  }
  return mixins;
}

function parseStyledComponents(
  sourceContents: string,
  transpilationMode?: "Css" | "CssModule",
): Record<string, StyledComponent> {
  // cross-file Styled Components are always in the following format:
  // /*YAK EXPORTED STYLED:ComponentName:ClassName*/
  const styledParts = sourceContents.split("/*YAK EXPORTED STYLED:");
  let styledComponents: Record<string, StyledComponent> = {};

  for (let i = 1; i < styledParts.length; i++) {
    const [comment] = styledParts[i].split("*/", 1);
    const [componentName, className] = comment.split(":");
    styledComponents[componentName] = {
      type: "styled-component",
      nameParts: componentName.split("."),
      value: transpilationMode === "Css" ? `.${className}` : `:global(.${className})`,
    };
  }

  return styledComponents;
}

function objectToModuleExport(object: object) {
  return Object.fromEntries(
    Object.entries(object).map(([key, value]): [string, ModuleExport] => {
      if (typeof value === "string" || typeof value === "number") {
        return [key, { type: "constant" as const, value }];
      } else if (value && (typeof value === "object" || Array.isArray(value))) {
        return [key, { type: "record" as const, value: objectToModuleExport(value) }];
      } else {
        return [key, { type: "unsupported" as const, hint: String(value) }];
      }
    }),
  );
}

export type ParseContext = {
  cache?: { parse?: Cache<ParsedModule> };
  transpilationMode?: "Css" | "CssModule";
  evaluateYakModule?: (
    modulePath: string,
  ) => Promise<Record<string, unknown>> | Record<string, unknown>;
  extractExports: (modulePath: string) => Promise<ModuleExports> | ModuleExports;
  getTransformed: (
    modulePath: string,
  ) => Promise<{ code: string; map?: string }> | { code: string; map?: string };
};

export type ModuleExports = {
  importYak: boolean;
  named: Record<string, ModuleExport>;
  all: string[];
};

export type ConstantExport = { type: "constant"; value: string | number };
export type RecordExport = {
  type: "record";
  value: Record<string, ModuleExport>;
};
export type UnsupportedExport = {
  type: "unsupported";
  hint?: string;
  /**
   * Source location of the offending expression. Populated by the parser
   * when it has access to source text; left undefined for runtime-evaluated
   * yak modules. The error formatter is responsible for any rendering.
   */
  source?: UnsupportedExportSource;
};

export type UnsupportedExportSource = {
  /** 1-based line number, 0-based column — same convention as Babel `loc`. */
  start: { line: number; column: number };
  end: { line: number; column: number };
  /** The text of `start.line` from the original source — kept so the
   * error formatter can render a snippet without re-reading the file. */
  lineText: string;
};
export type ReExport = { type: "re-export"; name: string; from: string };
export type NamespaceReExport = { type: "namespace-re-export"; from: string };
export type TagTemplateExport = { type: "tag-template" };

export type ModuleExport =
  | ConstantExport
  | TagTemplateExport
  | RecordExport
  | UnsupportedExport
  | ReExport
  | NamespaceReExport;

export type ParsedModule = {
  path: string;
  exports: ModuleExports;
} & (
  | {
      type: "regular";
      js?: { code: string; map?: string };
      styledComponents?: Record<string, StyledComponent>;
      mixins?: Record<string, Mixin>;
    }
  | {
      type: "yak";
    }
);

export type StyledComponent = {
  type: "styled-component";
  value: string;
  nameParts: string[];
};

export type Mixin = {
  type: "mixin";
  value: string;
  nameParts: string[];
  /** True for V2 mixins whose payload contains `@yak-branch` blocks and/or css variables */
  dynamic?: boolean;
};
