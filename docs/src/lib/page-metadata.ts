import type { Metadata } from "next";
import { SITE_NAME, absoluteUrl } from "./site";

export function pageMetadata({
  title,
  description,
  path,
  card,
  publishedTime,
  markdownPath,
  feed = false,
}: {
  title: string;
  description?: string;
  path: string;
  /** File name under public/og (written by scripts/generate-og.mjs), without extension. */
  card: string;
  publishedTime?: string;
  /** Path of the Markdown version of the page, linked as `rel="alternate"` for LLMs and agents. */
  markdownPath?: string;
  /** Link the blog RSS feed as `rel="alternate"`. */
  feed?: boolean;
}): Metadata {
  const images = [
    { url: `/og/${card}.png`, width: 1200, height: 630, alt: `${title} — ${SITE_NAME}` },
  ];
  return {
    title,
    description,
    alternates: {
      canonical: path,
      types: {
        ...(markdownPath ? { "text/markdown": absoluteUrl(markdownPath) } : {}),
        ...(feed ? { "application/rss+xml": absoluteUrl("/blog/feed.xml") } : {}),
      },
    },
    openGraph: {
      type: publishedTime ? "article" : "website",
      url: absoluteUrl(path),
      title,
      description,
      images,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: { card: "summary_large_image", title, description, images: images.map((i) => i.url) },
  };
}
