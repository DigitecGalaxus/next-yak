import type { ReactNode } from "react";
import { source } from "@/lib/source";
import NavTree from "@/components/docs/nav-tree";
import { RailLayout } from "@/components/docs/page-layout";

export default function DocumentationLayout({ children }: { children: ReactNode }) {
  return <RailLayout rail={<NavTree tree={source.pageTree} />}>{children}</RailLayout>;
}
