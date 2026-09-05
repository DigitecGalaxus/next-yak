const dataUrlImportPrefix = 'import "data:text/css;base64,';

/**
 * The SWC plugin emits a module's extracted CSS as a base64 data-url import on a line of
 * its own. Cross-file constants resolve only afterwards, so that line has to be swapped
 * for one carrying the resolved CSS.
 *
 * Modules which import next-yak without declaring styles get no such line and are
 * returned unchanged.
 *
 * The import is matched from the start of the line so that source code merely mentioning
 * a data url cannot be mistaken for it.
 */
export function replaceDataUrlImport(code: string, resolvedCss: string): string {
  const lines = code.split("\n");
  const lineIndex = lines.findIndex((line) => line.trimStart().startsWith(dataUrlImportPrefix));
  if (lineIndex === -1) {
    return code;
  }
  lines[lineIndex] = `${dataUrlImportPrefix}${Buffer.from(resolvedCss).toString("base64")}";`;
  return lines.join("\n");
}
