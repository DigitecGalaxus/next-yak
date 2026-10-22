import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { absoluteUrl } from "./site";

// Link previews cache an image by its URL, so a changed card keeps its old picture on LinkedIn,
// Slack and X for days. The URL carries a hash of the PNG: `/og/docs-vite.png?v=3f9a1c2b`
// changes exactly when scripts/generate-og.ts draws a different image

/** The absolute URL of a share card in public/og, versioned by its content */
export function cardUrl(card: string): string {
  const url = absoluteUrl(`/og/${card}.png`);
  try {
    const png = readFileSync(join(process.cwd(), "public/og", `${card}.png`));
    return `${url}?v=${createHash("sha256").update(png).digest("hex").slice(0, 8)}`;
  } catch {
    // `next dev` without `pnpm og` has no cards yet
    return url;
  }
}
