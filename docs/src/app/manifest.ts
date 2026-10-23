import type { MetadataRoute } from "next";
import { asset, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

/**
 * The name and icon a browser shows when someone installs the docs or pins them to a home
 * screen. The colors match the light page background in app/layout.tsx
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: asset("/"),
    display: "browser",
    background_color: "#faf5ef",
    theme_color: "#faf5ef",
    icons: [
      { src: asset("/icon.svg"), sizes: "any", type: "image/svg+xml" },
      { src: asset("/apple-icon.png"), sizes: "180x180", type: "image/png" },
    ],
  };
}
