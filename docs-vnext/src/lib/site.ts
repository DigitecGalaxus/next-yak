export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yak.js.org";

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (path: string) => `${BASE_PATH}${path}`;

/**
 * An absolute URL for a route, for the sitemap and for robots.txt.
 *
 * Do not reach for `new URL(path, SITE_URL)` here. A leading slash makes it resolve against
 * the origin alone, so `new URL("/docs", "https://host/next-yak")` gives
 * "https://host/docs" and drops the base path. On the Pages deploy that was every URL in
 * the sitemap, and every one of them answered 404.
 *
 * SITE_URL already carries the base path in that deploy. The check keeps the result right
 * either way, so a setup that sets only NEXT_PUBLIC_BASE_PATH still builds correct URLs.
 */
export function absoluteUrl(path: string): string {
  const origin = SITE_URL.replace(/\/+$/, "");
  const base = BASE_PATH && !origin.endsWith(BASE_PATH) ? `${origin}${BASE_PATH}` : origin;
  return `${base}${path}`;
}

export const SITE_NAME = "yak";

export const SITE_TITLE = "yak — zero-runtime CSS-in-JS for React, Solid & Qwik";

export const SITE_DESCRIPTION =
  "Write styled-components syntax and get build-time CSS extraction with zero runtime, full React Server Component support, across React, Solid, Qwik and every modern bundler.";
