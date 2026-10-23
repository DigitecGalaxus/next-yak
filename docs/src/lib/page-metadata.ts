import type { Metadata } from "next";
import { SIZE } from "../og/card.ts";
import { cardFor, type CardPage } from "../og/cards.ts";
import { cardUrl } from "./card-url";
import { SITE_NAME, absoluteUrl } from "./site";

/**
 * The share card of a page as Open Graph and X images. The URL is absolute: Slack, LinkedIn
 * and WhatsApp skip relative image URLs, and the preview build serves the site under /yak.
 * The alt text comes from the same copy as the card in og/cards.ts
 */
export function cardImages(card: string, page?: CardPage) {
  const alt = cardFor(card, page).alt;
  const url = cardUrl(card);
  return {
    openGraph: [{ url, type: "image/png", ...SIZE, alt }],
    twitter: [{ url, alt }],
  };
}

/**
 * Next replaces the layout's whole `openGraph` object with the page's, so every page repeats
 * the site-wide fields
 */
export const siteOpenGraph = { siteName: SITE_NAME, locale: "en_US" } as const;

export function pageMetadata({
  title,
  description,
  path,
  card,
  cardTitle,
  cardSubtitle,
  publishedTime,
  markdownPath,
  feed = false,
}: {
  title: string;
  description?: string;
  path: string;
  /** File name under public/og (written by scripts/generate-og.ts), without extension */
  card: string;
  /** The share card title from the frontmatter, see src/og/cards.ts */
  cardTitle?: string;
  /** The share card subtitle from the frontmatter, where "" removes the default */
  cardSubtitle?: string;
  publishedTime?: string;
  /** Path of the Markdown version of the page, linked as `rel="alternate"` for LLMs and agents. */
  markdownPath?: string;
  /** Link the blog RSS feed as `rel="alternate"`. */
  feed?: boolean;
}): Metadata {
  const images = cardImages(card, { title, cardTitle, cardSubtitle });
  // WhatsApp and Teams show og:title without the site name, so "Playground" becomes
  // "Playground | yak" like the document title. Titles that already name yak stay as they are
  const shareTitle = /\byak\b/.test(title) ? title : `${title} | ${SITE_NAME}`;
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
      ...siteOpenGraph,
      type: publishedTime ? "article" : "website",
      url: absoluteUrl(path),
      title: shareTitle,
      description,
      images: images.openGraph,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: images.twitter,
    },
  };
}
