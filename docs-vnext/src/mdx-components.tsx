import Link from "next/link";
import type { ComponentPropsWithoutRef, ComponentType } from "react";
import { styled } from "next-yak";
import { colors } from "@/tokens";
import { Callout } from "@/components/mdx/callout";
import { CodeBlock } from "@/components/mdx/code-block";
import { SideBySide } from "@/components/mdx/sideBySide";
import { Step, Steps } from "@/components/mdx/steps";
import { Tab, Tabs } from "@/components/mdx/tabs";
import { Popup, PopupContent, PopupTrigger } from "@/components/mdx/twoslash";

type MDXComponents = Record<string, ComponentType<any>>;

/**
 * Component map passed to rendered MDX (`<MDX components={...} />`).
 *
 * - `pre` → CodeBlock (title bar, copy button, theme-aware syntax colors)
 * - `a` → client-navigating Link for internal/relative links, plain anchor for
 *   external; relative links are resolved against the current page's URL
 * - `h2`/`h3`/`h4` → headings with hover anchor links
 * - custom components are exposed globally so MDX files don't each need to import them
 */
export function getMDXComponents(
  { pageUrl }: { pageUrl?: string } = {},
  components?: MDXComponents,
): MDXComponents {
  return {
    pre: CodeBlock,
    a: makeAnchor(pageUrl),
    h2: makeHeading("h2"),
    h3: makeHeading("h3"),
    h4: makeHeading("h4"),
    Callout,
    Tabs,
    Tab,
    Steps,
    Step,
    SideBySide,
    // twoslash hover popups (base-ui PreviewCard adapter)
    Popup,
    PopupTrigger,
    PopupContent,
    ...components,
  };
}

function makeAnchor(pageUrl?: string) {
  return function Anchor({ href = "", children, ...props }: ComponentPropsWithoutRef<"a">) {
    const external = /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");
    if (external) {
      return (
        <a href={href} target="_blank" rel="noreferrer" {...props}>
          {children}
        </a>
      );
    }

    if (href.startsWith("#")) {
      return (
        <a href={href} {...props}>
          {children}
        </a>
      );
    }

    // Internal link: absolute paths pass through; relative ones (./x, ../x) are
    // resolved against the current page so they still get client-side nav.
    const resolved =
      href.startsWith("/") || !pageUrl ? href : new URL(href, `https://h${pageUrl}`).pathname;

    return (
      <Link href={resolved} {...props}>
        {children}
      </Link>
    );
  };
}

function makeHeading(Tag: "h2" | "h3" | "h4") {
  return function Heading({ id, children, ...props }: ComponentPropsWithoutRef<"h2">) {
    if (!id) {
      return <Tag {...props}>{children}</Tag>;
    }
    return (
      <Tag id={id} {...props}>
        <HeadingAnchor href={`#${id}`}>{children}</HeadingAnchor>
      </Tag>
    );
  };
}

const HeadingAnchor = styled.a`
  position: relative;
  color: inherit;
  text-decoration: none;

  &::before {
    content: "#";
    position: absolute;
    left: -0.85em;
    color: ${colors.violetLight};
    opacity: 0;

    @media (prefers-reduced-motion: no-preference) {
      transition: opacity 0.12s ease;
    }
  }

  &:hover::before {
    opacity: 1;
  }
`;
