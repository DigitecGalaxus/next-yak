import { getPostsNewestFirst } from "@/lib/source";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

const escapeXml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// `date` has no time zone, so it is read as UTC (see formatPostDate)
const toRfc822 = (date: string) => new Date(`${date}T00:00:00Z`).toUTCString();

// RSS 2.0 feed of the blog: https://www.rssboard.org/rss-specification
export function GET() {
  const posts = getPostsNewestFirst();
  const feedUrl = absoluteUrl("/blog/feed.xml");

  const items = posts.map((post) => {
    const url = absoluteUrl(post.url);
    return [
      "    <item>",
      `      <title>${escapeXml(post.data.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <pubDate>${toRfc822(post.data.date)}</pubDate>`,
      post.data.description
        ? `      <description>${escapeXml(post.data.description)}</description>`
        : "",
      "    </item>",
    ]
      .filter(Boolean)
      .join("\n");
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${SITE_NAME} blog</title>`,
    `    <link>${absoluteUrl("/blog")}</link>`,
    "    <description>Notes on yak: the rename, the runtimes, and what is coming.</description>",
    "    <language>en</language>",
    `    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />`,
    posts[0] ? `    <lastBuildDate>${toRfc822(posts[0].data.date)}</lastBuildDate>` : "",
    ...items,
    "  </channel>",
    "</rss>",
  ]
    .filter(Boolean)
    .join("\n");

  return new Response(`${xml}\n`, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
