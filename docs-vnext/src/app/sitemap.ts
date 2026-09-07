import type { MetadataRoute } from "next";
import { source } from "@/lib/source";
import { SITE_URL } from "@/lib/site";

// Static export: emitted to out/sitemap.xml at build time.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const docs = source.getPages().map((page) => ({
    url: new URL(page.url, SITE_URL).toString(),
  }));

  return [
    { url: new URL("/", SITE_URL).toString() },
    { url: new URL("/playground", SITE_URL).toString() },
    ...docs,
  ];
}
