// Match a real `next-yak` import, not a loose substring (e.g. code samples in compiled MDX).
export const nextYakImportRegex = /(?:\bfrom\s*|\brequire\(\s*)["']next-yak[/"']/;

export const moduleImportsNextYak = (code: string): boolean => nextYakImportRegex.test(code);
