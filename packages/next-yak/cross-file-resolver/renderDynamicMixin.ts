/**
 * Renders the payload of a dynamic mixin (a V2 `YAK EXPORTED MIXIN` comment)
 * into the consumer's css at a `--yak-css-import` marker position.
 *
 * The static parts of the payload are spliced in place - exactly like a
 * static mixin. Conditional branches (`@yak-branch bN { ... }` blocks) can
 * not stay in place: their css only applies when the branch class is toggled
 * at runtime. Each branch is hoisted as a sibling rule with the branch class
 * as root and the consumer's nesting context replayed inside ("rule
 * splitting" - the same strategy the compiler uses for same-file dynamic
 * mixins). The enclosing rule is closed before and reopened after every
 * branch so the cascade order follows the interpolation position:
 *
 * ```css
 * :global(.Button_x) {
 *   &:hover {
 *     --yak-css-import: url("./styles:highlight",mixin,"Button__highlight_x");
 *   }
 * }
 * ```
 *
 * becomes
 *
 * ```css
 * :global(.Button_x) {
 *   &:hover {
 *     color: black;
 * }
 * }
 * :global(.Button__highlight_x-b0) {
 * &:hover {
 * color: red;
 * }
 * }
 * :global(.Button_x) {
 * &:hover {
 *     ...
 * ```
 *
 * This keeps the specificity of branch rules identical to consumer rules
 * (single class) and lets the cascade order follow the interpolation
 * position - moving a mixin to another file changes nothing observable.
 *
 * Slot markers (`--yak-css-import: url("...",mixin,@s0)`) reference
 * cross-file mixins used *inside* the exported mixin. They are rewritten to
 * concrete markers with the derived prefix `<scopePrefix>-s0` - the caller
 * resolves them in a follow-up pass (they were spliced into the consumer css
 * at a real position, so nested dynamic mixins get the correct context).
 */
export function renderDynamicMixin(options: {
  /** The consumer css that contains the marker (unmodified before `position`) */
  css: string;
  /** The position of the `--yak-css-import` marker inside `css` */
  position: number;
  /** The dynamic mixin payload (static css, `@yak-branch` blocks and slot markers) */
  payload: string;
  /** The usage-site scope prefix encoded in the marker */
  scopePrefix: string;
  /** Whether class selectors need the css-modules `:global()` wrapper */
  transpilationMode?: "Css" | "CssModule";
}): string {
  const { css, position, payload, scopePrefix, transpilationMode } = options;

  // Derive the prefixes of nested cross-file mixins (slots) from this usage
  // site - the resulting concrete markers are resolved by the caller
  const payloadWithSlots = substituteSlotMarkers(payload, scopePrefix);
  const segments = splitMixinPayload(payloadWithSlots);

  if (!segments.some((segment) => segment.type === "branch")) {
    return segments
      .map((segment) => segment.css)
      .join("")
      .trim();
  }

  const classSelector = (className: string) =>
    transpilationMode === "Css"
      ? `.${escapeCssClassName(className)}`
      : `:global(.${escapeCssClassName(className)})`;

  const scopeChain = computeOpenScopes(css, position);
  // Consumer css always wraps its content in the component's class rule, so a
  // marker without any open scope can only come from resolving a mixin
  // payload that still contains prefixed markers - the output of an older
  // compiler that baked fixed prefixes instead of @sN slot references.
  // Splicing branches without a rule context would silently produce wrong css.
  if (scopeChain.length === 0) {
    throw new Error(
      `Dynamic mixin (scope "${scopePrefix}") was referenced outside of a css rule - the importing file was compiled by an outdated yak compiler. Please ensure that next-yak and the yak compiler have matching versions and rebuild.`,
    );
  }
  // The root scope is the class of the consuming styled component - it is
  // replaced by the branch class as both classes end up on the same element.
  // All inner scopes (nested selectors, at-rules) are replayed inside.
  const innerScopes = scopeChain.slice(1);
  const closeAll = scopeChain.map(() => "}").join("\n");
  const reopen = scopeChain.map((scope) => `${scope} {`).join("\n");

  const parts: string[] = [];
  for (const segment of segments) {
    if (segment.type === "static") {
      const staticCss = segment.css.trim();
      if (staticCss !== "") {
        parts.push(staticCss);
      }
    } else {
      const scopes = [classSelector(`${scopePrefix}-b${segment.id}`), ...innerScopes];
      const open = scopes.map((scope) => `${scope} {`).join("\n");
      const close = scopes.map(() => "}").join("\n");
      const rule = `${open}\n${segment.css.trim()}\n${close}`;
      parts.push(closeAll, rule, reopen);
    }
  }

  return parts.filter((part) => part !== "").join("\n");
}

/**
 * The optional argument after the import kind of nested markers inside a
 * dynamic mixin payload is a slot reference (`@s0`) instead of a concrete
 * scope prefix - it is only known once the payload is rendered for a usage
 * site
 */
const slotMarkerRegex =
  /(--yak-css-import:\s*url\("[^"]+",(?:mixin|selector)),@s(\d+)\)/g;

function substituteSlotMarkers(payload: string, scopePrefix: string): string {
  return payload.replace(slotMarkerRegex, (_, marker, slotId) => {
    return `${marker},"${scopePrefix}-s${slotId}")`;
  });
}

export type MixinPayloadSegment =
  | { type: "static"; css: string }
  | { type: "branch"; id: number; css: string };

const branchStartRegex = /@yak-branch\s+b(\d+)\s*\{/g;

/**
 * Splits a dynamic mixin payload into an ordered list of static css segments
 * and `@yak-branch bN { ... }` blocks.
 *
 * Note: brace matching is currently naive - a `{`/`}` inside a css string
 * (e.g. `content: "}"`) inside a branch would break it. Good enough until
 * the payload format is final.
 */
export function splitMixinPayload(payload: string): MixinPayloadSegment[] {
  const segments: MixinPayloadSegment[] = [];
  let index = 0;

  while (index < payload.length) {
    branchStartRegex.lastIndex = index;
    const match = branchStartRegex.exec(payload);
    if (!match) {
      segments.push({ type: "static", css: payload.slice(index) });
      break;
    }

    if (match.index > index) {
      segments.push({ type: "static", css: payload.slice(index, match.index) });
    }

    let depth = 1;
    let cursor = branchStartRegex.lastIndex;
    while (cursor < payload.length && depth > 0) {
      const char = payload[cursor];
      if (char === "{") depth++;
      else if (char === "}") depth--;
      cursor++;
    }

    segments.push({
      type: "branch",
      id: Number(match[1]),
      css: payload.slice(branchStartRegex.lastIndex, cursor - 1),
    });
    index = cursor;
  }

  return segments;
}

/**
 * Escapes characters that are not valid in a css class selector
 * e.g. "aspectRatios_16:9_x-b0" -> "aspectRatios_16\:9_x-b0"
 * (the raw name is used in the class attribute, the escaped one in selectors)
 */
export function escapeCssClassName(className: string): string {
  return className.replace(/[^a-zA-Z0-9_-]/g, (char) => `\\${char}`);
}

/**
 * Computes the chain of open css scopes (selectors and at-rules) at
 * `position` by scanning the css from the beginning.
 *
 * e.g. for a position inside `.a { @media (x) { HERE } }` it returns
 * [".a", "@media (x)"]
 */
export function computeOpenScopes(css: string, position: number): string[] {
  const scopes: string[] = [];
  let buffer = "";
  let index = 0;

  while (index < position) {
    const char = css[index];
    const next = css[index + 1];

    // skip comments
    if (char === "/" && next === "*") {
      const end = css.indexOf("*/", index + 2);
      index = end === -1 ? position : end + 2;
      continue;
    }

    // skip strings (selectors may contain strings e.g. [data-foo="}"])
    if (char === '"' || char === "'") {
      let cursor = index + 1;
      while (cursor < css.length && css[cursor] !== char) {
        if (css[cursor] === "\\") cursor++;
        cursor++;
      }
      buffer += css.slice(index, cursor + 1);
      index = cursor + 1;
      continue;
    }

    if (char === "{") {
      scopes.push(buffer.trim());
      buffer = "";
    } else if (char === "}") {
      scopes.pop();
      buffer = "";
    } else if (char === ";") {
      buffer = "";
    } else {
      buffer += char;
    }
    index++;
  }

  return scopes;
}
