// Brand-matched code theme (navy editor background), shared by the landing-page
// highlighter (lib/shiki.ts) and the docs MDX pipeline (source.config.ts) so
// code blocks look the same everywhere. Kept side-effect free for import from
// the build config.
export const yakTheme = {
  name: "yak-night",
  type: "dark" as const,
  fg: "#ece3d2",
  bg: "#1f0a4d",
  settings: [
    { settings: { foreground: "#ece3d2", background: "#1f0a4d" } },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#8a7daf", fontStyle: "italic" },
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
      settings: { foreground: "#f178b6" },
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
      settings: { foreground: "#f5a973" },
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
      settings: { foreground: "#8bbcf0" },
    },
    {
      scope: ["variable", "variable.other", "meta.definition.variable"],
      settings: { foreground: "#ece3d2" },
    },
    {
      scope: [
        "punctuation",
        "meta.brace.round",
        "meta.brace.square",
        "punctuation.accessor",
        "punctuation.separator",
      ],
      settings: { foreground: "#bcb0d8" },
    },
  ],
};
