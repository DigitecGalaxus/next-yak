import { createGetUrl, llms, loader } from "fumadocs-core/source";
import {
  renderPlaceholder,
  type PlaceholderData,
} from "fumadocs-core/mdx-plugins/remark-llms.runtime";
import { docs, blog as posts } from "../../.source/server";
import { absoluteUrl } from "@/lib/site";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});

// `⟦1:styled.div⟧` link markers in code fences (see code-links.ts)
const CODE_LINK_MARKER = /⟦[1-6]:([^⟧]*)⟧/g;

const CALLOUT_ALERTS: Record<string, string> = { info: "NOTE", warn: "WARNING", error: "CAUTION" };

const quote = (text: string) =>
  text
    .trim()
    .split("\n")
    .map((line) => (line ? `> ${line}` : ">"))
    .join("\n");

// Markdown for the MDX components listed in `mdxAsPlaceholder` (source.config.ts). The source
// text around a placeholder keeps its own line breaks, so the output is trimmed.
const placeholders: Record<string, (data: PlaceholderData) => string> = {
  Tabs: ({ attributes, children }) =>
    typeof attributes.title === "string"
      ? `**${attributes.title}**\n\n${children.trim()}`
      : children.trim(),
  // one line break plus the one between `</Tab>` and `<Tab>` in the source gives a blank line
  Tab: ({ attributes, children }) => `${attributes.value}:\n\n${children.trim()}\n`,
  Callout: ({ attributes, children }) => {
    const alert = CALLOUT_ALERTS[String(attributes.type ?? "info")] ?? "NOTE";
    return quote(`[!${alert}]\n${children}`);
  },
  Steps: ({ children }) => children.trim(),
  Step: ({ children }) => children.trim(),
};

export const docsLlms = llms(source, {
  renderPage: async (page) => {
    const body = await renderPlaceholder(await page.data.getText("processed"), placeholders);
    const description = page.data.description ? `> ${page.data.description}\n\n` : "";
    return `# ${page.data.title} (${absoluteUrl(page.url)})\n\n${description}${body.replace(CODE_LINK_MARKER, "$1").trim()}\n`;
  },
});

export const docsContentRoute = "/llms.mdx/docs";

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[] }) {
  const segments = [...page.slugs, "content.md"];
  return { segments, url: getContentUrl(segments) };
}

export const blog = loader({
  baseUrl: "/blog",
  source: posts.toFumadocsSource(),
});

// `next build` sets NODE_ENV to production, so the deployed site never lists or builds a draft.
export const showDrafts = process.env.NODE_ENV !== "production";

export function getPostsNewestFirst() {
  return blog
    .getPages()
    .filter((post) => showDrafts || !post.data.draft)
    .sort((a, b) => b.data.date.localeCompare(a.data.date));
}

export type Post = ReturnType<typeof getPostsNewestFirst>[number];

// The newest featured post, or the newest post when none is featured.
export function splitFeatured(posts: Post[]): { featured?: Post; rest: Post[] } {
  const featured = posts.find((post) => post.data.featured) ?? posts[0];
  return { featured, rest: posts.filter((post) => post !== featured) };
}

const WORDS_PER_MINUTE = 220;

export async function readingMinutes(post: Post): Promise<number> {
  const body = (await post.data.getText("raw")).replace(/^---[\s\S]*?---/, "");
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function getPost(slug: string) {
  const post = blog.getPage([slug]);
  return post && (showDrafts || !post.data.draft) ? post : undefined;
}

// `date` has no time zone. Parse and print it as UTC, or it reads a day early west of Greenwich.
export function formatPostDate(date: string, month: "long" | "short" = "long"): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month,
    year: "numeric",
    timeZone: "UTC",
  });
}
