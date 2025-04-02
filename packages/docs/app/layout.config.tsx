import { YakLogo } from "@/components/yakIcon";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: <YakLogo />,
  },
  links: [
    {
      text: "Documentation",
      url: "/docs/getting-started",
      active: "nested-url",
    },
    {
      text: "Playground",
      url: "/playground",
      active: "nested-url",
    },
  ],
  githubUrl: "https://github.com/jantimon/next-yak",
};
