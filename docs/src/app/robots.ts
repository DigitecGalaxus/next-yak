import type { MetadataRoute } from "next";
import { absoluteUrl, IS_PREVIEW_DEPLOY } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", ...(IS_PREVIEW_DEPLOY ? { disallow: "/" } : { allow: "/" }) },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
