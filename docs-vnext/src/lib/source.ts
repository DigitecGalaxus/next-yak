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

export function getPostsNewestFirst() {
  return [...blog.getPages()].sort((a, b) => b.data.date.localeCompare(a.data.date));
}

// `date` has no time zone. Parse and print it as UTC, or it reads a day early west of Greenwich.
export function formatPostDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
