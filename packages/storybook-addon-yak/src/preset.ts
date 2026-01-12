import { resolveYakContext } from "next-yak/withYak";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path, { dirname } from "node:path";

const require = createRequire(import.meta.url); // esm only

export interface YakAddonOptions {
  /** Path to custom yak context file for theming */
  contextPath?: string;
  /** Whether to minify CSS output (defaults to NODE_ENV === 'production') */
  minify?: boolean;
  /** Prefix for generated class names */
  prefix?: string;
  /** Whether to include display names for debugging */
  displayNames?: boolean;
  /** Experimental options */
  experiments?: {
    /** CSS transpilation mode: "Css" or "CssModule" */
    transpilationMode?: "Css" | "CssModule";
  };
}

interface StorybookOptions {
  presetsList?: Array<{
    name: string;
    options?: YakAddonOptions;
    preset?: { name: string; options?: YakAddonOptions };
  }>;
  [key: string]: unknown;
}

/**
 * Extracts yak addon options from Storybook's options
 */
function getYakOptions(options: StorybookOptions): YakAddonOptions {
  const yakAddon = options.presetsList?.find(
    (p) =>
      p.name === "storybook-addon-yak" ||
      p.preset?.name === "storybook-addon-yak",
  );
  return yakAddon?.options ?? yakAddon?.preset?.options ?? {};
}

/**
 * Finds the path to the yak-swc WASM plugin
 */
async function findYakSwcPlugin(): Promise<string> {
  try {
    const packageJsonPath = require.resolve("yak-swc/package.json");
    const packageRoot = dirname(packageJsonPath);
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    return path.resolve(packageRoot, packageJson.main);
  } catch (e) {
    throw new Error(`Could not resolve yak-swc plugin: ${e}`);
  }
}

/**
 * Vite builder configuration
 */
export async function viteFinal(config: any, options: StorybookOptions) {
  const yakOptions = getYakOptions(options);

  try {
    const { viteYak } = await import("next-yak/vite");
    const yakPlugin = await viteYak({
      minify: yakOptions.minify,
      contextPath: yakOptions.contextPath,
      prefix: yakOptions.prefix,
      displayNames: yakOptions.displayNames,
      experiments: yakOptions.experiments,
    });

    config.plugins = config.plugins || [];
    config.plugins.push(yakPlugin);
  } catch (e) {
    throw new Error(
      `Failed to load vite-plugin for next-yak. ` +
        `Make sure you have vite installed. Error: ${e}`,
    );
  }

  return config;
}

/**
 * Webpack builder configuration
 * Requires @storybook/addon-webpack5-compiler-swc for SWC support
 */
export async function webpackFinal(config: any, options: StorybookOptions) {
  const yakOptions = getYakOptions(options);
  const yakSwcPath = await findYakSwcPlugin();

  const minify = yakOptions.minify ?? process.env.NODE_ENV === "production";
  const displayNames = yakOptions.displayNames ?? !minify;
  // Default to "Css" mode for webpack (simpler, no CSS modules complexity)
  const transpilation = yakOptions.experiments?.transpilationMode ?? "Css";

  // Determine CSS extension based on transpilation mode
  const cssExtension = transpilation === "Css" ? ".yak.css" : ".yak.module.css";

  const yakPluginOptions = {
    minify,
    basePath: process.cwd(),
    prefix: yakOptions.prefix,
    displayNames,
    importMode: {
      // Webpack inline match resource pattern for CSS extraction
      value: `./{{__BASE_NAME__}}${cssExtension}!=!./{{__BASE_NAME__}}?./{{__BASE_NAME__}}${cssExtension}`,
      transpilation,
      encoding: "None",
    },
  };

  // Add webpack loader for yak CSS extraction
  const testPattern =
    transpilation === "Css" ? /\.yak\.css$/ : /\.yak\.module\.css$/;

  config.module = config.module || {};
  config.module.rules = config.module.rules || [];
  config.module.rules.push({
    test: testPattern,
    loader: require.resolve("next-yak/loaders/webpack-loader"),
    options: yakOptions,
  });

  // Find and modify swc-loader to add yak-swc plugin
  const isSwcLoader = (loader: string | undefined) => {
    if (!loader || typeof loader !== "string") return false;
    return loader.includes("swc-loader") && !loader.includes("css-loader");
  };

  const modifySwcLoader = (use: any) => {
    if (!use || typeof use !== "object") return;
    if (!isSwcLoader(use.loader)) return;

    use.options = use.options || {};
    use.options.jsc = use.options.jsc || {};
    // Ensure React transform uses automatic runtime
    use.options.jsc.transform = use.options.jsc.transform || {};
    use.options.jsc.transform.react = use.options.jsc.transform.react || {};
    use.options.jsc.transform.react.runtime =
      use.options.jsc.transform.react.runtime || "automatic";
    // Add yak-swc plugin
    use.options.jsc.experimental = use.options.jsc.experimental || {};
    use.options.jsc.experimental.plugins =
      use.options.jsc.experimental.plugins || [];
    // Check if plugin is already added
    const hasYakPlugin = use.options.jsc.experimental.plugins.some(
      (p: any) => Array.isArray(p) && p[0]?.includes?.("yak-swc"),
    );
    if (!hasYakPlugin) {
      use.options.jsc.experimental.plugins.push([yakSwcPath, yakPluginOptions]);
    }
  };

  const processRule = (rule: any) => {
    if (!rule) return;
    // Handle direct use
    if (rule.use) {
      const uses = Array.isArray(rule.use) ? rule.use : [rule.use];
      for (const use of uses) {
        modifySwcLoader(use);
      }
    }
    // Handle loader directly on rule
    if (rule.loader && isSwcLoader(rule.loader)) {
      rule.options = rule.options || {};
      rule.options.jsc = rule.options.jsc || {};
      rule.options.jsc.transform = rule.options.jsc.transform || {};
      rule.options.jsc.transform.react = rule.options.jsc.transform.react || {};
      rule.options.jsc.transform.react.runtime =
        rule.options.jsc.transform.react.runtime || "automatic";
      rule.options.jsc.experimental = rule.options.jsc.experimental || {};
      rule.options.jsc.experimental.plugins =
        rule.options.jsc.experimental.plugins || [];
      const hasYakPlugin = rule.options.jsc.experimental.plugins.some(
        (p: any) => Array.isArray(p) && p[0]?.includes?.("yak-swc"),
      );
      if (!hasYakPlugin) {
        rule.options.jsc.experimental.plugins.push([
          yakSwcPath,
          yakPluginOptions,
        ]);
      }
    }
    // Handle oneOf rules
    if (rule.oneOf) {
      for (const nestedRule of rule.oneOf) {
        processRule(nestedRule);
      }
    }
    // Handle rules array
    if (rule.rules) {
      for (const nestedRule of rule.rules) {
        processRule(nestedRule);
      }
    }
  };

  for (const rule of config.module.rules) {
    processRule(rule);
  }

  // Set up context alias for theming
  const yakContext = resolveYakContext(
    yakOptions.contextPath,
    config.context || process.cwd(),
  );
  if (yakContext) {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias["next-yak/context/baseContext"] = yakContext;
  }

  return config;
}
