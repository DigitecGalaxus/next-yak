"use client";

import { use, useMemo } from "react";
import { highlighterPromise, yakTheme } from "@/lib/shiki";

/** The compiled CSS or JS, in the same colours as every code block on the site. */
export function OutputView({ code, lang }: { code: string; lang: "css" | "tsx" }) {
  const highlighter = use(highlighterPromise);
  const html = useMemo(
    () => highlighter.codeToHtml(code || "/* no output */", { lang, theme: yakTheme.name }),
    [highlighter, code, lang],
  );
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
