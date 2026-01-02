// Dashed ident (CSS custom property)
export const thumbSize = {
    name: "--thumb-size",
    toString () {
        return "var(--thumb-size)";
    }
};
// Non-dashed ident (grid-area, etc.)
export const trackArea = {
    name: "track",
    toString () {
        return "track";
    }
};
// CSS mixin using the idents
export const sliderStyles = {
    __yak: `
  ${thumbSize.name}: 24px;
  width: ${thumbSize};
  grid-area: ${trackArea};
`
};
