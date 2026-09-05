// The server half of the hydration test: renders the shared tree and keeps
// the markup as a file snapshot. hydration/hydrate.test.ts hydrates that file.
// Update both sides with `vitest -u` when the markup changes on purpose.
import { expect, it } from "vitest";
import { renderToString } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createTree } from "../hydration/tree.ts";

it("renders the hydration tree", async () => {
  const [i] = createSignal(0);
  const html = renderToString(() => createTree(i), { noScripts: true });
  await expect(html).toMatchFileSnapshot("../hydration/tree.ssr.html");
});
