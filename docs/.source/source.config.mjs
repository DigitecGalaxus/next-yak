// source.config.ts
import { transformerNotationDiff } from "@shikijs/transformers";
import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { transformerTwoslash } from "fumadocs-twoslash";
var docs = defineDocs({
  dir: "content/docs"
});
var source_config_default = defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      themes: {
        light: "vitesse-light",
        dark: "vitesse-dark"
      },
      transformers: [
        ...rehypeCodeDefaultOptions.transformers ?? [],
        transformerNotationDiff(),
        transformerTwoslash({
          twoslashOptions: {
            compilerOptions: {
              jsx: 1,
              // JSX preserve
              paths: {
                "@/*": ["./*"]
              }
            }
          }
        })
      ]
    }
  }
});
export {
  source_config_default as default,
  docs
};
