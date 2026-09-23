import type { MetadataRoute } from "next";
import { source } from "@/lib/source";
import { blog } from "@/lib/blog";
import { absoluteUrl } from "@/lib/site";

// Static export: emitted to out/sitemap.xml at build time.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const docs = source.getPages().map((page) => ({ url: absoluteUrl(page.url) }));

  // The docs carry no date, so only the posts get a lastModified. A wrong date is worse
  // than none: a crawler that sees today on every page learns to ignore the field.
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
