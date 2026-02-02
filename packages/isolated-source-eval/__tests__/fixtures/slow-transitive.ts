import { primaryColor } from "./tokens.ts";
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
await delay(200);
export const color = primaryColor;
