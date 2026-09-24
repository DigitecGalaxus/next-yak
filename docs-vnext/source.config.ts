import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";
import { defineConfig, defineDocs, frontmatterSchema } from "fumadocs-mdx/config";
import { z } from "zod";
import { transformerTwoslash } from "fumadocs-twoslash";
import { createFileSystemTypesCache } from "fumadocs-twoslash/cache-fs";
import { yakTheme } from "./src/lib/yak-theme";
import cssStyled from "./src/lib/langs/css-styled";
import styled from "./src/lib/langs/styled";

export const docs = defineDocs({
  dir: "src/content/docs",
});

/**
 * The blog. It shares the docs pipeline, so a post gets the same MDX components, the same
 * shiki grammars and the same twoslash cache as a docs page.
 *
 * A post carries two fields a docs page does not. `date` decides the order of the index,
 * so it is required: a post with no date would sort as if it had none, and the newest
 * post is the one a reader wants first. It parses as an ISO date, so a typo fails the
 * build instead of shipping an unreadable byline.
 */
export const blog = defineDocs({
  dir: "src/content/blog",
  docs: {
    schema: frontmatterSchema.extend({
      date: z.iso.date(),
      author: z.string().optional(),
    }),
  },
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      // Same theme for light + dark so the dual `--shiki-*` custom properties survive for
      // <CodeBlock>'s light-dark() resolution.
      themes: { light: yakTheme, dark: yakTheme },
      // Custom grammars so CSS inside styled`…`/css`…` literals is highlighted per-property
      // (same as lib/shiki.ts). `styled` injects into ts/tsx fences; cssStyled builds on `css`.
      // Both grammars embed `source.tsx#…` rules, so `tsx` must load even for a page with
      // only `ts` fences. Without it, interpolations and generics get no scopes.
      langs: ["tsx", "css", styled, cssStyled],
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        // twoslash fences emit Popup/PopupTrigger/PopupContent, rendered by our base-ui
        // adapter (mdx-components.tsx → components/mdx/twoslash.tsx).
        transformerTwoslash({
          // Cache each block's twoslash result to disk (keyed by code hash) so warm runs
          // skip type-checking. Without it, the 8 type-checked blocks on the Features page
          // each instantiate the full next-yak + React type graph and the heap OOMs past 24 GB.
          typesCache: createFileSystemTypesCache(),
          twoslashOptions: {
            compilerOptions: {
              jsx: 1, // preserve
              paths: { "@/*": ["./*"] },
              // Skip re-checking standard/ambient libs per block; hovers still resolve.
              skipLibCheck: true,
              skipDefaultLibCheck: true,
            },
          },
        }),
        // `as any`: fumadocs-core and -twoslash resolve different @shikijs/types versions —
        // nominally different ShikiTransformer types, runtime-compatible.
      ] as any,
    },
  },
});
