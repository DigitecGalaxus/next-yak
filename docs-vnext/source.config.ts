import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { transformerTwoslash } from "fumadocs-twoslash";
import { createFileSystemTypesCache } from "fumadocs-twoslash/cache-fs";
import { yakTheme } from "./src/lib/yak-theme";
import cssStyled from "./src/lib/langs/css-styled";
import styled from "./src/lib/langs/styled";

export const docs = defineDocs({
  dir: "src/content/docs",
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      // Same theme for light + dark so the dual `--shiki-*` custom properties survive for
      // <CodeBlock>'s light-dark() resolution.
      themes: { light: yakTheme, dark: yakTheme },
      // Custom grammars so CSS inside styled`…`/css`…` literals is highlighted per-property
      // (same as lib/shiki.ts). `styled` injects into ts/tsx fences; cssStyled builds on `css`.
      langs: ["css", styled, cssStyled],
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
