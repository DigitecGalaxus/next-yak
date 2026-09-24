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
  // Numbers, booleans, hex colors and CSS units. Kept apart from strings so `8px` and `"8px"` differ.
  constant: "#c9a2ff",
  // Types, components and tags: the nouns of the code.
  type: "#7fdcc5",
  // Functions and tagged templates (`styled`, `css`): the verbs of the code.
  func: "#ece27c",
  // Object keys, JSX attributes and CSS property names.
  property: "#8bbcf0",
  // Also used for operators, so `=`, `=>` and `&&` recede instead of reading as keywords.
  punctuation: "#a99fc4",
} as const;

// Brand-matched code theme (navy editor background), shared by the landing-page
// highlighter (lib/shiki.ts) and the docs MDX pipeline (source.config.ts) so
// code blocks look the same everywhere. Kept side-effect free for import from
// the build config.
//
// Each group has one role. When a scope matches more than one group, the more specific
// selector wins (`keyword.operator` beats `keyword`), which is how operators leave the
// keyword color and CSS units leave it too.
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
        "keyword.operator.new",
        "keyword.operator.expression",
        "keyword.control.at-rule",
        "punctuation.definition.keyword",
      ],
      settings: { foreground: syntax.keyword },
    },
    {
      scope: [
        "string",
        "string.template",
        "string.quoted",
        "punctuation.definition.string",
        "support.constant.property-value",
        "meta.property-value",
      ],
      settings: { foreground: syntax.string },
    },
    {
      scope: [
        "constant.numeric",
        "constant.language",
        "constant.language.boolean",
        "keyword.other.unit",
        "constant.other.color",
        "constant.other.color punctuation.definition.constant",
        "constant.character.escape",
        "variable.other.constant.property",
      ],
      settings: { foreground: syntax.constant },
    },
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "entity.other.inherited-class",
        "support.type",
        "support.type.primitive",
        "support.class",
        "support.class.component",
        "entity.name.tag",
      ],
      settings: { foreground: syntax.type },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "meta.function-call entity.name.function",
        "entity.name.function.tagged-template",
      ],
      settings: { foreground: syntax.func },
    },
    {
      scope: [
        "meta.object-literal.key",
        "support.type.property-name",
        "entity.other.attribute-name",
        "variable.other.property",
        "variable.other.object.property",
      ],
      settings: { foreground: syntax.property },
    },
    {
      scope: ["variable", "variable.other", "meta.definition.variable", "variable.parameter"],
      settings: { foreground: syntax.fg },
    },
    {
      scope: [
        "punctuation",
        "meta.brace.round",
        "meta.brace.square",
        "punctuation.accessor",
        "punctuation.separator",
        "punctuation.definition.tag",
        "punctuation.definition.template-expression",
        "keyword.operator",
        "storage.type.function.arrow",
      ],
      settings: { foreground: syntax.punctuation },
    },
  ],
};
