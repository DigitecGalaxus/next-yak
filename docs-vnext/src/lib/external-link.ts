export const externalLinkProps = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

export const isExternalHref = (href: string) =>
  /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");

export const EXTERNAL_LINK_HINT = " (opens in a new tab)";
