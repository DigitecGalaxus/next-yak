import { withYak, type YakConfigOptions } from "next-yak/withYak";
import webpack from "webpack";
import { createFsFromVolume, Volume } from "memfs";
import path from "path";
import { ufs } from "unionfs";
import * as fs from "fs";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

/**
 * Main compilation function that orchestrates the entire process.
 * Sets up file systems, creates Webpack config, attaches listeners,
 * applies Yak configuration, and runs the Webpack compiler.
 */
export const compile = async (
  files: Record<string, string>,
  yakConfig: YakConfigOptions = {},
): Promise<Record<string, string>> => {
  const { hybridFileSystem } = setupFileSystems(files);
  const webpackConfig = createWebpackConfig(files);
  const compileResults = attachLoaderCompilationListener(webpackConfig);
  const configWithYak = await applyYakConfig(webpackConfig, yakConfig);
  await runWebpackCompiler(configWithYak, hybridFileSystem);
  return compileResults;
};

/** 
 * Sets up the memory and hybrid file systems based on the provided files.
 * Creates a memory file system, populates it with the given files, and combines
 * it with the real file system to create a hybrid file system for Webpack.
 */
const setupFileSystems = (files: Record<string, string>) => {
  const memoryFileSystem = createFsFromVolume(new Volume());
  Object.entries(files).forEach(([filename, file]) => {
    const fullpath = path.resolve(__dirname, filename);
    memoryFileSystem.mkdirSync(path.dirname(fullpath), { recursive: true });
    memoryFileSystem.writeFileSync(fullpath, file);
  });
  // Webpack loaders should be read from the real file system
  // @ts-ignore
  const hybridFileSystem = ufs.use(fs).use(memoryFileSystem);
  return { memoryFileSystem, hybridFileSystem };
};

/**
 * Creates a Webpack configuration object based on the provided files.
 * Sets up entry points, output settings, module rules, and resolve options.
 */
const createWebpackConfig = (files: Record<string, string>): webpack.Configuration => {
  const entry = Object.entries(files)
    // take only the first file as the entry point
    .find(([name]) => name.endsWith("index.tsx")) ||
    // fallback to the first file
    Object.entries(files)[0];
  return {
    context: __dirname,
    mode: "development",
    entry: Object.fromEntries([[path.basename(entry[0]), entry[0]] as const]),
    output: {
      path: "/dist",
      filename: "[name].js",
    },
    module: {
      rules: [
        // css loader
        {
          test: /\.css$/,
          use: {
            loader: path.resolve(__dirname, "./comment-loader.cjs"),
          },
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".tsx"],
    },
  };
};

const attachSWCLoader = (webpackConfig: webpack.Configuration) => {
  const loader = {
    test: /\.tsx?$/,
    use: {
      loader: "swc-loader",
      options: {
        "jsc": {
          "experimental": {
            "plugins": [] as unknown[],
          }
        }
      }
    },
  };
  webpackConfig.module = webpackConfig.module || { };
  webpackConfig.module.rules = webpackConfig.module.rules || [];
  webpackConfig.module.rules.push(loader);
  return loader;
}

/**
 * This listener captures the compilation results for each module,
 * filtering out node_modules and dist files to allow inspection of the loader results
 */
const attachLoaderCompilationListener = (webpackConfig: webpack.Configuration): Record<string, string> => {
  const compileResults: Record<string, string> = {};
  webpackConfig.plugins = webpackConfig.plugins || [];
  webpackConfig.plugins.push({
    apply(compiler) {
      compiler.hooks.compilation.tap("YakTest", (compilation) => {
        compilation.hooks.succeedModule.tap("YakTest", (module) => {
          if (!module.resource) {
            return;
          }
          // ignore node_modules
          if (module.resource?.includes("node_modules")) {
            return;
          }
          // ignore dist
          if (module.resource?.includes("dist")) {
            return;
          }
          const result = String(module._source?._value || "");
          const isCss = module.resource.endsWith(".css");
          compileResults[path.relative(__dirname, module.resource)] = (isCss
            ? // Remove the first and second line (injected by comment-loader.js)
              result.split("\n").slice(1, -1).join("\n")
            : result).trim();
        });
      });
    },
  });
  return compileResults;
};

/**
 * Applies the Yak configuration to the a minimal fake Next.js configuration
 * Basically, it just adds the Yak loader to the Webpack configuration with the given options
 */
const applyYakConfig = async (webpackConfig: webpack.Configuration, yakConfig: YakConfigOptions) => {
  const loader = attachSWCLoader(webpackConfig);
  const miniNextConfig = await withYak(yakConfig, {
    webpack: () => ({
      ...webpackConfig,
    }),
  });
  loader.use.options.jsc.experimental.plugins = (miniNextConfig as {
    experimental?: {
      swcPlugins: unknown[];
    };
  }).experimental?.swcPlugins || [];
  return miniNextConfig.webpack();
};

/**
 * Runs the Webpack compiler with the given configuration and file system.
 * Returns a promise that resolves only if there are no compilation errors.
 */
const runWebpackCompiler = (config: webpack.Configuration, fileSystem: any): Promise<void> => {
  const compiler = webpack(config);
  // @ts-ignore
  compiler.inputFileSystem = fileSystem;
  // @ts-ignore
  compiler.outputFileSystem = fileSystem;

  return new Promise<void>((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
        return;
      }
      if (stats && stats.hasErrors()) {
        reject(stats.toString());
        return;
      }
      resolve();
    });
  });
};
