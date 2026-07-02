// Functions that build the palette's color strings. `brand`/`paper` take a lightness and read the
// chroma off a per-family curve, so most colors are one number; pass a 2nd arg to force the chroma.

type Stops = ReadonlyArray<readonly [number, number]>;

// Chroma at a lightness, linearly interpolated between a family's [lightness, chroma] points.
const chromaAt = (stops: Stops, l: number): number => {
  if (l <= stops[0][0]) return stops[0][1];
  const last = stops[stops.length - 1];
  if (l >= last[0]) return last[1];
  for (let i = 1; i < stops.length; i++) {
    const [l0, c0] = stops[i - 1];
    const [l1, c1] = stops[i];
    if (l <= l1) return c0 + ((c1 - c0) * (l - l0)) / (l1 - l0);
  }
  return last[1];
};
const round = (n: number) => Math.round(n * 1e4) / 1e4;

const BRAND: Stops = [
  [0.206, 0.1],
  [0.232, 0.112],
  [0.446, 0.079],
  [0.95, 0.015],
];
const PAPER: Stops = [
  [0.78, 0.039],
  [0.872, 0.01],
  [0.994, 0.007],
];

export const brand = (l: number, c: number = chromaAt(BRAND, l)) => `oklch(${l} ${round(c)} 293)`;
export const paper = (l: number, c: number = chromaAt(PAPER, l)) => `oklch(${l} ${round(c)} 72)`;
export const redOk = (l: number, c: number) => `oklch(${l} ${c} 31)`;
export const cyanOk = (l: number, c: number) => `oklch(${l} ${c} 198)`;
export const alpha = (c: string, a: number) => `rgb(from ${c} r g b / ${a})`;
