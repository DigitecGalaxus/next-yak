import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  // @ts-expect-error Different react versions
  return {
    ...defaultMdxComponents,
    ...components,
  };
}
