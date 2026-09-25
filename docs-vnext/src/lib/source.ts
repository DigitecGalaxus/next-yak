import { loader } from "fumadocs-core/source";
import { docs, blog as posts } from "../../.source/server";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});

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
