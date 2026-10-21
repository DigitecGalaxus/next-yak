import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

const REPOSITORY_URL = "https://github.com/DigitecGalaxus/next-yak";

/** Structured data for search engines (https://schema.org). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // `<` is escaped so a value can never close the script tag
  const json = JSON.stringify({ "@context": "https://schema.org", ...data }).replace(
    /</g,
    "\\u003c",
  );
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function softwareSourceCode(version: string | null) {
  return {
    "@type": "SoftwareSourceCode",
    name: SITE_NAME,
    // the old package name, so searches for it land here
    alternateName: ["next-yak", "@yak/react"],
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
    codeRepository: REPOSITORY_URL,
    programmingLanguage: ["TypeScript", "Rust"],
    runtimePlatform: "Node.js",
    license: "https://opensource.org/licenses/MIT",
    ...(version ? { version } : {}),
    author: { "@type": "Organization", name: "Digitec Galaxus", url: "https://www.galaxus.ch" },
  };
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function blogPosting(post: {
  title: string;
  description?: string;
  path: string;
  date: string;
  author?: string;
  card: string;
}) {
  return {
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: absoluteUrl(post.path),
    mainEntityOfPage: absoluteUrl(post.path),
    datePublished: post.date,
    image: absoluteUrl(`/og/${post.card}.png`),
    author: { "@type": "Organization", name: post.author ?? `The ${SITE_NAME} team` },
    publisher: { "@type": "Organization", name: "Digitec Galaxus", url: "https://www.galaxus.ch" },
  };
}
