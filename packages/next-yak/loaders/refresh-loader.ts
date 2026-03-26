/**
 * Webpack loader that registers next-yak styled components with React Fast
 * Refresh ($RefreshReg$). Without this, styled-only files (files that export
 * only styled() components) are not recognized as React component modules by
 * SWC's react-refresh transform, causing full page reloads during HMR.
 *
 * How it works:
 * - The yak-swc SWC plugin emits comments like:
 *     `\/*YAK EXPORTED STYLED:ComponentName:className*\/`
 *   for every exported styled component.
 * - This loader detects those comments and injects $RefreshReg$ calls:
 *     `var _c = ComponentName; $RefreshReg$(_c, "ComponentName");`
 * - React Fast Refresh then recognizes the module as a component module and
 *   can hot-swap it without a full reload.
 *
 * This loader should only run in development mode (non-server compilation).
 */
import type { LoaderDefinitionFunction } from "webpack";

const STYLED_COMMENT_REGEX =
  /\/\*YAK EXPORTED STYLED:([^:]+):[^*]+\*\//g;

const refreshLoader: LoaderDefinitionFunction = function (source) {
  // Extract all exported styled component names from yak-swc comments
  const componentNames: string[] = [];
  let match;
  while ((match = STYLED_COMMENT_REGEX.exec(source)) !== null) {
    componentNames.push(match[1]);
  }

  if (componentNames.length === 0) {
    return source;
  }

  // Generate $RefreshReg$ calls for each styled component.
  // This follows the same pattern SWC uses for regular function components:
  //   var _c;
  //   _c = ComponentName;
  //   $RefreshReg$(_c, "ComponentName");
  const registrations = componentNames
    .map((name, i) => {
      const varName = `_yak_c${i === 0 ? "" : i}`;
      return `var ${varName} = ${name};\n$RefreshReg$(${varName}, "${name}");`;
    })
    .join("\n");

  return `${source}\n\n/* next-yak: React Fast Refresh registration for styled components */\n${registrations}\n`;
};

export default refreshLoader;
