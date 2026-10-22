import { docsLlms, getPageMarkdownUrl, getPostsNewestFirst, source } from "@/lib/source";
import { absoluteUrl, SITE_DESCRIPTION } from "@/lib/site";

export const revalidate = false;

const RENAME_NOTE = `Up to version 9, the React package was called \`next-yak\`. From version 10 it is \`@yak/react\`:
install \`@yak/react\` and import from \`@yak/react\`, never from \`next-yak\`. The ESLint plugin is
\`@yak/eslint-plugin\`, the Storybook addon is \`@yak/storybook\` and the Solid package is \`@yak/solid\`.`;

// The llms.txt format: https://llmstxt.org
export async function GET() {
  // `index()` titles the list with the root of the page tree ("ui" in meta.json) and links the
  // HTML pages relative to the site, so swap in the site name and absolute Markdown links
  const markdownUrls = new Map(
    source.getPages().map((page) => [page.url, absoluteUrl(getPageMarkdownUrl(page).url)]),
  );
  const index = (await docsLlms.index())
    .replace(/^# .*\n/, "")
    .replace(/\]\((\/docs\/[^)]*)\)/g, (link, url: string) => `](${markdownUrls.get(url) ?? url})`);

  const posts = getPostsNewestFirst().map((post) => {
    const description = post.data.description ? `: ${post.data.description}` : "";
    return `- [${post.data.title}](${absoluteUrl(post.url)})${description}`;
  });

  const text = [
    "# yak",
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    RENAME_NOTE,
    `The full docs in one file: ${absoluteUrl("/llms-full.txt")}`,
    "",
    index.trim(),
    "",
    "## Blog",
    "",
    ...posts,
  ].join("\n");

  return new Response(`${text}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
