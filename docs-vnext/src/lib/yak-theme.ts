// The code-highlight palette. Raw hex (not CSS vars): shiki bakes these into token
// colors at build time. This file is the leaf home for them because it's imported by
// source.config.ts, which runs outside Next — so it must stay free of `var(--…)`,
// `next/font`, and next-yak. `@/tokens` re-exports this as `syntax` for runtime use.
export const syntax = {
  fg: "#ece3d2",
  bg: "#231442",
  comment: "#8a7daf",
  keyword: "#f178b6",
  string: "#f5a973",
  entity: "#8bbcf0",
  punctuation: "#bcb0d8",
} as const;

// Brand-matched code theme (navy editor background), shared by the landing-page
// highlighter (lib/shiki.ts) and the docs MDX pipeline (source.config.ts) so
// code blocks look the same everywhere. Kept side-effect free for import from
// the build config.
export const yakTheme = {
  name: "yak-night",
  type: "dark" as const,
  fg: syntax.fg,
  bg: syntax.bg,
  settings: [
    { settings: { foreground: syntax.fg, background: syntax.bg } },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: syntax.comment, fontStyle: "italic" },
    },
    {
      scope: [
        "keyword",
        "storage",
        "storage.type",
        "storage.modifier",
        "keyword.control",
        "keyword.operator",
        "keyword.operator.new",
        "keyword.operator.expression",
        "keyword.operator.arrow",
        "entity.name.tag",
        "punctuation.definition.tag",
      ],
      settings: { foreground: syntax.keyword },
    },
    {
      scope: [
        "string",
        "string.template",
        "string.quoted",
        "punctuation.definition.string",
        "constant.numeric",
        "constant.language",
        "constant.language.boolean",
        "support.constant",
        "support.constant.property-value",
        "constant.other.color",
        "meta.property-value",
      ],
      settings: { foreground: syntax.string },
    },
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "entity.name.type.class",
        "support.type",
        "support.class",
        "entity.name.function",
        "support.function",
        "variable.parameter",
        "variable.other.readwrite",
        "meta.object-literal.key",
        "support.type.property-name",
        "entity.other.attribute-name",
      ],
      settings: { foreground: syntax.entity },
    },
    {
      scope: ["variable", "variable.other", "meta.definition.variable"],
      settings: { foreground: syntax.fg },
    },
    {
      scope: [
        "punctuation",
        "meta.brace.round",
        "meta.brace.square",
        "punctuation.accessor",
        "punctuation.separator",
      ],
      settings: { foreground: syntax.punctuation },
    },
  ],
};
