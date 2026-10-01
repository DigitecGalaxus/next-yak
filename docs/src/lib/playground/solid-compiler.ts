import { transform } from "@babel/standalone";
import solid from "@solidjs/babel-plugin";

/**
 * Compiles Solid 2 JSX with Solid's own Babel plugin, as @solidjs/vite-plugin does for a
 * client-only app. The input is yak's output with the JSX kept, so the types are gone already.
 */
export function compileSolidJsx(code: string, filename: string, commonjs: boolean): string {
  const result = transform(code, {
    filename,
    babelrc: false,
    configFile: false,
    // the CSS loader reads the yak comments in the CommonJS copy
    comments: true,
    plugins: [
      keepCssIndent,
      [solid, { generate: "dom", hydratable: false }],
      ...(commonjs ? ["transform-modules-commonjs"] : []),
    ],
  });
  return result.code ?? "";
}

/**
 * Babel removes as many leading spaces from each line of a block comment as the comment's
 * start column. The yak CSS comment starts after `const Button =`, so its CSS would lose
 * all indentation. Without a location, Babel prints the comment as it is.
 */
const keepCssIndent = {
  pre(file: { ast: { comments?: { value: string; loc?: unknown }[] | null } }) {
    for (const comment of file.ast.comments ?? []) {
      if (comment.value.startsWith("YAK")) comment.loc = undefined;
    }
  },
};
