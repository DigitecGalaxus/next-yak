import { type Cache } from "./types.js";

export async function parseModule(context: ParseContext, modulePath: string) {
  try {
    if (context.cache?.parse === undefined) {
      return uncachedParseModule(context, modulePath);
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
    throw new Error(
      `Error parsing file ${modulePath}: ${(error as Error).message}`,
    );
  }
}

export async function uncachedParseModule(
  context: ParseContext,
  modulePath: string,
): Promise<ParsedModule> {
  const isYak =
    modulePath.endsWith(".yak.ts") ||
    modulePath.endsWith(".yak.tsx") ||
    modulePath.endsWith(".yak.js") ||
    modulePath.endsWith(".yak.jsx");

  // handle yak file by evaluating and mapping exported value to the
  // `ModuleExport` format.
  if (isYak && context.evaluateYakModule) {
    const yakModule = await context.evaluateYakModule(modulePath);
    const yakExports = objectToModuleExport(yakModule);

    return { type: "yak", exports: { importYak:false, named: yakExports, all:[] }, path: modulePath };
  }

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
  const styledComponents = parseStyledComponents(
    transformed.code,
    context.transpilationMode,
  );

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
  // Mixins are always in the following format:
  // /*YAK EXPORTED MIXIN:fancy:aspectRatio:16:9
  // css
  // */
  const mixinParts = sourceContents.split("/*YAK EXPORTED MIXIN:");
  let mixins: Record<
    string,
    { type: "mixin"; value: string; nameParts: string[] }
  > = {};

  for (let i = 1; i < mixinParts.length; i++) {
    const [comment] = mixinParts[i].split("*/", 1);
    const position = comment.indexOf("\n");
    const name = comment.slice(0, position);
    const value = comment.slice(position + 1);
    mixins[name] = {
      type: "mixin",
      value,
      nameParts: name.split(":").map((part) => decodeURIComponent(part)),
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
      value:
        transpilationMode === "Css"
          ? `.${className}`
          : `:global(.${className})`,
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
        return [
          key,
          { type: "record" as const, value: objectToModuleExport(value)  },
        ];
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
  extractExports: (
    modulePath: string,
  ) => Promise<ModuleExports> | ModuleExports;
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
export type UnsupportedExport = { type: "unsupported"; hint?: string };
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

export type Mixin = { type: "mixin"; value: string; nameParts: string[] };
