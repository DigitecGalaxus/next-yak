// The text of every share card, read by scripts/generate-og.ts to draw the card and by
// lib/page-metadata.ts to write its alt text, so the image and its description never differ
//
// A card key is the file name under public/og: `home`, `github`, `playground`, `blog`,
// `docs-<slug>` and `blog-<slug>`. The four fixed cards are written out below. Docs and blog
// cards come from the page frontmatter:
//
//   title: Vite
//   cardTitle: Set up yak | with Vite   # optional, `|` breaks the line, else `title`
//   cardSubtitle: ""                    # optional, see SUBTITLE
//
// Word list:
// - template: the layout in card.ts (home, github, docs, playground, blog)
// - label: the overline above the title, "Documentation" or the blog post `type`
// - lines: the title, one array entry per line, two lines at most and no closing period
// - subtitle: the muted lines under the title of a docs or blog card
// - url: the address in the card footer. It names the target domain on every build, also on the
//   github.io preview, because people should remember yak.js.org

const HOST = "yak.js.org";

/** The frontmatter fields a docs or blog card reads */
export interface CardPage {
  title: string;
  cardTitle?: string;
  cardSubtitle?: string;
  /** The blog post `type`, drawn as the overline */
  type?: string;
}

/** A technology name found in a card title, see findLogo() */
export interface FoundLogo {
  line: number;
  index: number;
  word: string;
  /** The file in og/logos without `.svg` */
  file: string;
}

type Template = "home" | "github" | "docs" | "playground" | "blog";

// The home and GitHub cards show the wordmark as their headline, so `lines` is the name
const HOME = {
  lines: ["yak"],
  tagline: ["Vanilla CSS syntax in TS", "Zero runtime"],
};

// The subtitle of every docs and blog card, so a reader who does not know yak sees that it is
// about CSS. `cardSubtitle` in the frontmatter replaces it, and an empty string removes it
const SUBTITLE = "Vanilla CSS syntax in TS | Zero runtime";

const FIXED: Record<string, { template: Template; lines: string[]; tagline?: string[] }> = {
  home: { template: "home", ...HOME },
  /** The repository preview, uploaded by hand on GitHub under Settings, Social preview */
  github: { template: "github", ...HOME },
  playground: { template: "playground", lines: ["Playground"] },
  blog: { template: "blog", lines: ["Blog"] },
};

// The technologies yak integrates with: the name as it appears in a title, and the file in
// og/logos that is also the docs slug of its setup guide. A title gets the logo after the
// first name: "Set up yak | with Vite" -> "with Vite <logo>". A setup guide shows its own
// path in the footer: yak.js.org/docs/vite, not yak.js.org/docs
const LOGOS: Record<string, string> = {
  React: "react",
  Vite: "vite",
  Solid: "solid",
  Qwik: "qwik",
  "Next.js": "next",
  TanStack: "tanstack",
  Rspack: "rspack",
  Rsbuild: "rsbuild",
  Storybook: "storybook",
};
const TECH_SLUGS = new Set(Object.values(LOGOS));
// Setup guides whose page has another slug, shown by their short address. app/docs/react
// forwards `/docs/react` to the guide
const TECH_ALIASES: Record<string, string> = { "getting-started": "react" };

// Case-sensitive and whole words only, so "@yak/react" and "Reactivity" stay plain text
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const LOGO_WORD = new RegExp(
  `(?<![\\w@/-])(${Object.keys(LOGOS).map(escape).join("|")})(?![\\w-])`,
);

/**
 * The first technology name across the title lines, or undefined.
 * card.ts calls it on the lines it draws, after any wrapping
 */
export function findLogo(lines: string[]): FoundLogo | undefined {
  for (const [line, text] of lines.entries()) {
    const m = LOGO_WORD.exec(text);
    if (m) return { line, index: m.index, word: m[1], file: LOGOS[m[1]] };
  }
  return undefined;
}

// "Set up yak | with Vite" -> ["Set up yak", "with Vite"], "" -> []
const split = (text: string | undefined) =>
  text ? text.split("|").map((line) => line.trim()) : [];

// The blog `type` frontmatter as an overline: `deep-dive` -> "Deep dive"
const typeLabel = (type: string | undefined) =>
  type && type[0].toUpperCase() + type.slice(1).replace(/-/g, " ");

/** The card for one key. The fixed cards ignore `page` */
export function cardFor(key: string, page: CardPage = { title: key }) {
  const { title, cardTitle, cardSubtitle, type } = page;
  const fixed = FIXED[key] as (typeof FIXED)[string] | undefined;
  const template: Template = fixed?.template ?? (key.startsWith("blog-") ? "blog" : "docs");
  const lines = fixed?.lines ?? split(cardTitle ?? title);
  const isPage = !fixed || key === "blog";
  const subtitle = isPage ? split(cardSubtitle ?? SUBTITLE) : undefined;
  const label = template === "docs" ? "Documentation" : fixed ? undefined : typeLabel(type);

  const [section, ...rest] = key.split("-");
  const slug = TECH_ALIASES[rest.join("-")] ?? rest.join("-");
  const url =
    key === "github"
      ? "galaxuslabs/yak"
      : key === "home"
        ? HOST
        : section === "docs" && TECH_SLUGS.has(slug)
          ? `${HOST}/docs/${slug}`
          : `${HOST}/${section}`;

  // `yak — Set up yak with Vite — yak.js.org/docs/vite`, and the home card says "yak" only once
  const heading = lines.join(" ");
  const alt = [
    "yak",
    heading === "yak" ? "" : heading,
    (fixed?.tagline ?? subtitle)?.join(" · "),
    url,
  ]
    .filter(Boolean)
    .join(" — ");
  return { template, label, lines, tagline: fixed?.tagline, subtitle, url, alt };
}

/** The cards that belong to no content page, which the generator draws on every build */
export const fixedKeys = Object.keys(FIXED);

/** What card.ts draws */
export type CardData = ReturnType<typeof cardFor>;
