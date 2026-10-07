import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";

// With `staticGET`, Next prerenders the search index to static JSON for the static export
export const revalidate = false;

export const { staticGET: GET } = createFromSource(source);
