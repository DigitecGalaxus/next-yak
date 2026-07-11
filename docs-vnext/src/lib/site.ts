export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yak.js.org";

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (path: string) => `${BASE_PATH}${path}`;

export const SITE_NAME = "yak";

export const SITE_TITLE = "yak — zero-runtime CSS-in-JS for React, Solid & Qwik";

export const SITE_DESCRIPTION =
  "Write styled-components syntax and get build-time CSS extraction with zero runtime, full React Server Component support, across React, Solid, Qwik and every modern bundler.";
