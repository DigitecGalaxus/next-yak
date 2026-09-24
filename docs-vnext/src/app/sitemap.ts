import type { MetadataRoute } from "next";
import { source, blog } from "@/lib/source";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const docs = source.getPages().map((page) => ({ url: absoluteUrl(page.url) }));

  // Docs have no date. A fake lastModified is worse than none.
  const posts = blog.getPages().map((post) => ({
    url: absoluteUrl(post.url),
    lastModified: new Date(post.data.date),
  }));

  return [
    { url: absoluteUrl("/") },
    { url: absoluteUrl("/playground") },
    { url: absoluteUrl("/blog") },
    ...docs,
    ...posts,
  ];
}
