import { docsLlms, getPageMarkdownUrl, source } from "@/lib/source";
import { notFound } from "next/navigation";

export const revalidate = false;

type RouteProps = { params: Promise<{ slug?: string[] }> };

export async function GET(_request: Request, props: RouteProps) {
  const { slug } = await props.params;
  // remove the appended "content.md"
  const page = source.getPage(slug?.slice(0, -1) ?? []);
  if (!page) notFound();

  return new Response(await docsLlms.page(page), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({ slug: getPageMarkdownUrl(page).segments }));
}
