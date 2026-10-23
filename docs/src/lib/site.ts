/**
 * Link previews and search engines get https URLs only. The Pages settings can report an
 * http address for a custom domain, so every host except localhost is upgraded
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://yak.js.org").replace(
  /^http:\/\/(?!(?:localhost|127\.0\.0\.1)(?:[:/]|$))/,
  "https://",
);

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// The GitHub Pages build before the domain cutover. Search engines skip it, so it does not
// compete with yak.js.org.
export const IS_PREVIEW_DEPLOY = new URL(SITE_URL).hostname.endsWith(".github.io");

export const asset = (path: string) => `${BASE_PATH}${path}`;

// Not `new URL(path, SITE_URL)`: a leading slash would drop the base path from SITE_URL.
// SITE_URL may or may not already include BASE_PATH.
export function absoluteUrl(path: string): string {
  const origin = SITE_URL.replace(/\/+$/, "");
  const base = BASE_PATH && !origin.endsWith(BASE_PATH) ? `${origin}${BASE_PATH}` : origin;
  return `${base}${path}`;
}

export const SITE_NAME = "yak";

export const SITE_TITLE = "yak: zero-runtime CSS-in-JS for React and Solid";

export const SITE_DESCRIPTION =
  "Write styled-components syntax and get build-time CSS extraction with zero runtime, full React Server Component support, across React, Solid and every modern bundler.";
