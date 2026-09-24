export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yak.js.org";

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (path: string) => `${BASE_PATH}${path}`;

// Not `new URL(path, SITE_URL)`: a leading slash would drop the base path from SITE_URL.
// SITE_URL may or may not already include BASE_PATH.
export function absoluteUrl(path: string): string {
  const origin = SITE_URL.replace(/\/+$/, "");
  const base = BASE_PATH && !origin.endsWith(BASE_PATH) ? `${origin}${BASE_PATH}` : origin;
  return `${base}${path}`;
}

export const SITE_NAME = "yak";

export const SITE_TITLE = "yak — zero-runtime CSS-in-JS for React, Solid & Qwik";

export const SITE_DESCRIPTION =
  "Write styled-components syntax and get build-time CSS extraction with zero runtime, full React Server Component support, across React, Solid, Qwik and every modern bundler.";
