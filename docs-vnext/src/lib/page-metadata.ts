import type { Metadata } from "next";
import { SITE_NAME, absoluteUrl } from "./site";

/**
 * The per-page social block: the share card, the title, the description and the URL.
 *
 * Without it every page inherits the root layout's block, so a share of any docs page or
 * any post shows the homepage card and the homepage title. The card lives at
 * `/og/<card>.png`, written by scripts/generate-og.mjs before the build.
 */
export function pageMetadata({
  title,
  description,
  path,
  card,
  publishedTime,
}: {
  title: string;
  description?: string;
  /** The route, for the canonical link and for og:url. */
  path: string;
  /** The card file name under public/og, without the extension. */
  card: string;
  /** Set on a blog post. It turns the card into an article for a crawler. */
  publishedTime?: string;
}): Metadata {
  const images = [
    { url: `/og/${card}.png`, width: 1200, height: 630, alt: `${title} — ${SITE_NAME}` },
  ];
  return {
    title,
    description,
    alternates: { canonical: path },
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
