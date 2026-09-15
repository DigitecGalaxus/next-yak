import type { ClientPreset } from "fumadocs-core/search/client";

/**
 * Single source of truth for the search client.
 *
 * `static` downloads the prebuilt Orama index emitted by `staticGET`
 * (see app/api/search/route.ts) once, then runs every query in the browser — no
 * server required, so the site can be statically exported. Moving to a
 * server-backed search later is a one-line change to
 * `{ type: "fetch", api: "/api/search" }`; everything downstream consumes the
 * same `SortedResult[]` shape regardless of client.
 */
export const searchClient = {
  type: "static",
  from: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/search`,
} as const satisfies ClientPreset;
