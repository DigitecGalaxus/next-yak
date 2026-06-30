import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";

// `revalidate = false` + `staticGET` makes Next prerender the whole Orama search
// index into a static JSON asset at build time (served at /api/search). No server
// runs at request time, so the docs stay fully static-exportable
export const revalidate = false;

export const { staticGET: GET } = createFromSource(source);
