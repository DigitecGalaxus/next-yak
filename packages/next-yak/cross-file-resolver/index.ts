// Public entry for custom bundler integrations (e.g. esbuild): the
// bundler-agnostic cross-file resolve logic, usable without webpack.
// Pair with `next-yak/isolated-source-eval` for `.yak` file evaluation.
export { parseModule, uncachedParseModule } from "yak-internals/cross-file-resolver/parse-module";
export type {
  ParseContext,
  ModuleExports,
  ModuleExport,
  ParsedModule,
  StyledComponent,
  Mixin,
  UnsupportedExportSource,
} from "yak-internals/cross-file-resolver/parse-module";
export {
  resolveCrossFileConstant,
  uncachedResolveCrossFileConstant,
} from "yak-internals/cross-file-resolver/resolve";
export type {
  ResolveContext,
  ResolvedModule,
  ResolvedExports,
  ResolvedExport,
} from "yak-internals/cross-file-resolver/resolve";
export {
  CauseError,
  ResolveError,
  UnsupportedExportError,
  CircularDependencyError,
} from "yak-internals/cross-file-resolver/errors";
export { parseExports } from "yak-internals/parse-exports";
