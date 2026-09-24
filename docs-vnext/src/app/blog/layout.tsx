import type { ReactNode } from "react";
import { getPostsNewestFirst } from "@/lib/source";
import PostNav from "@/components/blog/post-nav";
import { RailLayout } from "@/components/docs/page-layout";

export default function BlogLayout({ children }: { children: ReactNode }) {
  const posts = getPostsNewestFirst().map((post) => ({ url: post.url, title: post.data.title }));
  return <RailLayout rail={<PostNav posts={posts} />}>{children}</RailLayout>;
}
