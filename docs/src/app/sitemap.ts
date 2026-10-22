import type { MetadataRoute } from "next";
import { source, getPostsNewestFirst } from "@/lib/source";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const docs = source.getPages().map((page) => ({ url: absoluteUrl(page.url) }));

  // Docs have no date. A fake lastModified is worse than none.
  const posts = getPostsNewestFirst().map((post) => ({
    url: absoluteUrl(post.url),
    lastModified: new Date(post.data.date),
  }));

  return [
    { url: absoluteUrl("/") },
    { url: absoluteUrl("/playground") },
    // the blog index changes with its newest post
    { url: absoluteUrl("/blog"), lastModified: posts[0]?.lastModified },
    ...docs,
    ...posts,
  ];
}
