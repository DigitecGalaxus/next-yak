/**
 * One rule for every link that leaves the site: a new tab, and the same rel pair.
 *
 * The site had three rules before. The footer opened a tab, the header GitHub button
 * replaced the page, and the drawer asked for `noreferrer` alone. Benchmarks and the
 * GitHub icon sat 40px apart in the same bar and behaved differently.
 *
 * `noreferrer` already implies `noopener` in every current browser. The pair stays
 * written out, so a reader of the markup does not have to know that.
 */
export const externalLinkProps = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

/** True for a href that leaves the site. MDX authors write both forms. */
export const isExternalHref = (href: string) =>
  /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");

/** Read by a screen reader after the label, because the arrow glyph is decorative. */
export const EXTERNAL_LINK_HINT = " (opens in a new tab)";
