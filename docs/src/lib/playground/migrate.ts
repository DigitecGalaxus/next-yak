/**
 * Updates the code of a share link from the old playground (next-yak 9 and earlier),
 * so that it compiles with @yak/react 10. Returns null when nothing changed.
 */
export function migrateFiles(files: Record<string, string>): Record<string, string> | null {
  let changed = false;
  const result: Record<string, string> = {};
  for (const [name, content] of Object.entries(files)) {
    const migrated = unwrapGlobalSelectors(renameImports(content));
    changed ||= migrated !== content;
    result[name] = migrated;
  }
  return changed ? result : null;
}

/** imports from next-yak and the next-yak JSX import source pragma point at @yak/react now */
function renameImports(code: string): string {
  return code
    .replace(/(["'])next-yak(\/[\w/-]*)?\1/g, "$1@yak/react$2$1")
    .replace(/(@jsxImportSource\s+)next-yak\b/g, "$1@yak/react");
}

/**
 * `:global(selector)` was needed for CSS Modules, which yak no longer outputs. In 10.0 it is a
 * build error, so the selector inside replaces it.
 */
function unwrapGlobalSelectors(code: string): string {
  const marker = ":global(";
  let result = "";
  let index = 0;
  for (;;) {
    const start = code.indexOf(marker, index);
    if (start === -1) return result + code.slice(index);
    // find the matching parenthesis, the selector can contain `:not(…)` and the like
    let depth = 1;
    let end = start + marker.length;
    while (end < code.length && depth > 0) {
      if (code[end] === "(") depth++;
      else if (code[end] === ")") depth--;
      end++;
    }
    if (depth > 0) return result + code.slice(index);
    result += code.slice(index, start) + code.slice(start + marker.length, end - 1);
    index = end;
  }
}
