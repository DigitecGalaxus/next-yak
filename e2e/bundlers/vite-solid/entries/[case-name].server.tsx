import { generateHydrationScript, renderToString } from "@solidjs/web";
import App from "../cases/[case-name]/index.tsx";

/** the markup for the root and what belongs in the head, hydration bootstrap first */
export function render() {
  let head = "";
  const html = renderToString(() => <App />, { onHead: (tag: string) => (head += tag) });
  return { html, head: generateHydrationScript() + head };
}
