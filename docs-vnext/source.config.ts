import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";
import { defineConfig, defineDocs, frontmatterSchema } from "fumadocs-mdx/config";
import { z } from "zod";
import { transformerTwoslash } from "fumadocs-twoslash";
import { createFileSystemTypesCache } from "fumadocs-twoslash/cache-fs";
import { yakTheme } from "./src/lib/yak-theme";
import cssStyled from "./src/lib/langs/css-styled";
import styled from "./src/lib/langs/styled";
import { transformerCodeLinks } from "./src/lib/code-links";

export const docs = defineDocs({
  dir: "src/content/docs",
});

export const blog = defineDocs({
  dir: "src/content/blog",
  docs: {
    schema: frontmatterSchema.extend({
      date: z.iso.date(),
      author: z.string().optional(),
      // Drafts show in `next dev` only. See `showDrafts` in src/lib/source.ts.
      draft: z.boolean().default(false),
      type: z.enum(["announcement", "release", "deep-dive", "guide"]),
      // The blog index shows the newest featured post as the big card on top.
      featured: z.boolean().default(false),
    }),
  },
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      // Both slots are set so shiki emits the `--shiki-light/-dark` vars <CodeBlock> reads.
      themes: { light: yakTheme, dark: yakTheme },
      // The custom grammars embed `source.tsx#…` rules, so `tsx` must load even for a page
      // with only `ts` fences.
      langs: ["tsx", "css", styled, cssStyled],
      transformers: [
        transformerCodeLinks(),
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        transformerTwoslash({
          // Without the disk cache, the type-checked blocks on the Features page run the heap
          // out of memory (past 24 GB).
          typesCache: createFileSystemTypesCache(),
          twoslashOptions: {
            compilerOptions: {
              jsx: 1, // preserve
              paths: { "@/*": ["./*"] },
              skipLibCheck: true,
              skipDefaultLibCheck: true,
            },
          },
        }),
        // fumadocs-core and fumadocs-twoslash resolve different @shikijs/types versions.
      ] as any,
    },
  },
});
