/**
 * Represents a unique, scoped CSS identifier created by the `ident` function.
 *
 * @usage
 *
 * ```tsx
 * import { ident, styled } from "next-yak";
 *
 * // CSS custom property (dashed-ident)
 * const thumbSize = ident`--thumb-size`;
 *
 * // Custom identifier (for grid areas, container names, etc.)
 * const mainArea = ident`main`;
 *
 * const Slider = styled.div`
 *   // Use .name for the raw identifier (property names, quoted values)
 *   ${thumbSize.name}: 24px;
 *   grid-template-areas: "${mainArea.name}";
 *
 *   // Direct interpolation: var() for dashed, raw for custom
 *   width: ${thumbSize};  // outputs: var(--slider_thumbSize_hash)
 *   grid-area: ${mainArea};  // outputs: slider_mainArea_hash
 * `;
 * ```
 */
export interface YakIdent {
  /** The raw identifier string (e.g., "--slider_thumbSize_hash" or "slider_mainArea_hash") */
  readonly name: string;
  /**
   * String coercion returns appropriate format:
   * - For dashed-idents (--*): returns var(--name)
   * - For custom-idents: returns the raw name
   */
  toString(): string;
  /** Symbol.toPrimitive for template literal interpolation */
  [Symbol.toPrimitive](hint: string): string;
}

/**
 * Creates a unique, scoped CSS identifier at build time.
 *
 * During compilation, the SWC plugin transforms this tagged template literal
 * into a function call with the scoped identifier:
 * `ident\`--thumb-size\`` -> `ident("--slider_thumbSize_hash")`
 *
 * @param identifierOrStyles - Either a string (after SWC transformation) or TemplateStringsArray (before transformation)
 * @returns A YakIdent object with .name property and toString/toPrimitive methods
 */
export const ident = (
  identifierOrStyles: string | TemplateStringsArray,
): YakIdent => {
  // Handle both:
  // - After SWC transformation: ident("--slider_thumbSize_hash") - receives string
  // - Before transformation (or in tests): ident`--thumb-size` - receives TemplateStringsArray
  const identifier =
    typeof identifierOrStyles === "string"
      ? identifierOrStyles
      : identifierOrStyles[0];
  const isDashed = identifier.startsWith("--");
  return {
    get name() {
      return identifier;
    },
    toString() {
      return isDashed ? `var(${identifier})` : identifier;
    },
    [Symbol.toPrimitive]() {
      return isDashed ? `var(${identifier})` : identifier;
    },
  };
};
