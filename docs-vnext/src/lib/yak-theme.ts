// Raw hex, not CSS vars: shiki bakes these in at build time. source.config.ts imports this
// file outside Next, so it must not import next-yak or next/font.
export const syntax = {
  fg: "#ece3d2",
  bg: "#231442",
  comment: "#8a7daf",
  keyword: "#f178b6",
  string: "#f5a973",
  // numbers, booleans, hex colors and CSS units
  constant: "#c9a2ff",
  // types, components and tags
  type: "#7fdcc5",
  // functions and tagged templates (`styled`, `css`)
  func: "#ece27c",
  // object keys, JSX attributes and CSS property names
  property: "#8bbcf0",
  // also operators
  punctuation: "#a99fc4",
} as const;

// When a scope matches several groups, the more specific selector wins
// (`keyword.operator` beats `keyword`).
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
