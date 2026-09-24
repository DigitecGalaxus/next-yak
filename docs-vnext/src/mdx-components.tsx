import Link from "next/link";
import type { ComponentPropsWithoutRef, ComponentType } from "react";
import { styled } from "next-yak";
import { light, dark } from "@/tokens";
import { Callout } from "@/components/mdx/callout";
import { CodeBlock } from "@/components/mdx/code-block";
import { SideBySide } from "@/components/mdx/sideBySide";
import { Step, Steps } from "@/components/mdx/steps";
import { Tab, Tabs } from "@/components/mdx/tabs";
import { Popup, PopupContent, PopupTrigger } from "@/components/mdx/twoslash";
import { externalLinkProps, isExternalHref } from "@/lib/external-link";

type MDXComponents = Record<string, ComponentType<any>>;

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
    img: MdxImage,
    Callout,
    Tabs,
    Tab,
    Steps,
    Step,
    SideBySide,
    Popup,
    PopupTrigger,
    PopupContent,
    ...components,
  };
}

type StaticImage = { src: string; width: number; height: number };

// fumadocs turns `![alt](/img/x.svg)` into an image import, so `src` is a static image
// object rather than a string. Its URL already carries the base path.
function MdxImage({ src, width, height, alt = "", ...props }: ComponentPropsWithoutRef<"img">) {
  const image = typeof src === "object" && src !== null ? (src as unknown as StaticImage) : null;
  return (
    <Image
      src={image ? image.src : src}
      width={width ?? image?.width}
      height={height ?? image?.height}
      alt={alt}
      {...props}
    />
  );
}

const Image = styled.img`
  max-width: 100%;
  height: auto;
`;

function makeAnchor(pageUrl?: string) {
  return function Anchor({ href = "", children, ...props }: ComponentPropsWithoutRef<"a">) {
    if (isExternalHref(href)) {
      return (
        <a href={href} {...externalLinkProps} {...props}>
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

    // resolve relative links against the page so they still get client-side navigation
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
    color: light-dark(${light.violetSoft}, ${dark.fog});
    opacity: 0;

    @media (prefers-reduced-motion: no-preference) {
      transition: opacity 0.12s ease;
    }
  }

  &:hover::before {
    opacity: 1;
  }
`;
