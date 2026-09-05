// Vite serves a file's text for `?raw` imports; used by the hydration test
declare module "*.html?raw" {
  const text: string;
  export default text;
}
