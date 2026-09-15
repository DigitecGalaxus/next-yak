import { test, expect, type Page } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

// class and style differ per styled component (generated names), they get
// their own assertions
const IGNORED = new Set(["_hk", "data-testid", "class", "style"]);

/** attributes of the element with this test id in the raw server html */
function serverAttributes(html: string, testId: string): Record<string, string | undefined> {
  // attribute values may contain ">" so the tag body is matched with quotes in mind
  const tags = [...html.matchAll(/<[a-z]+\b((?:[^>"]|"[^"]*")*)>/g)].map((match) => match[1]);
  const body = tags.find((tag) => tag.includes(`data-testid="${testId}"`));
  expect(body, `server html has ${testId}`).toBeDefined();
  const attributes: Record<string, string | undefined> = {};
  // solid writes the hydration key unquoted (_hk=1), everything else quoted
  for (const match of body!.matchAll(/([\w:-]+)(?:="([^"]*)"|=[^\s"]+)?/g)) {
    if (!IGNORED.has(match[1])) attributes[match[1]] = match[2];
  }
  return attributes;
}

/** attributes of the element with this test id in the hydrated dom */
async function domAttributes(page: Page, testId: string): Promise<Record<string, string>> {
  const attributes = await page
    .getByTestId(testId)
    .evaluate((element) =>
      Object.fromEntries(
        element.getAttributeNames().map((name) => [name, element.getAttribute(name)!]),
      ),
    );
  for (const name of IGNORED) delete attributes[name];
  return attributes;
}

test(
  "serializes the same attributes on a styled div and a styled a",
  withTestEnv("ssr-attributes", async (testEnv, page) => {
    if (testEnv.framework === "solid") {
      // the server html before any script runs; the hydrated dom below can hide
      // a difference the client patches away
      const html = await (await page.request.get(testEnv.url)).text();
      for (const pair of ["static", "dynamic"]) {
        const div = serverAttributes(html, `${pair}-div`);
        expect(serverAttributes(html, `${pair}-a`), `${pair} server attributes`).toEqual(div);
        expect(div["data-on"]).toBeUndefined();
        expect(div["data-empty"]).toBeUndefined();
        expect(div["data-num"]).toBe("0");
        expect(div["data-text"]).toBe("a&amp;b&quot;c&lt;d>");
        expect(div).not.toHaveProperty("data-off");
        expect(div).not.toHaveProperty("data-none");
        expect(div).not.toHaveProperty("hidden");
        expect(div).not.toHaveProperty("onclick");
        expect(div).not.toHaveProperty("onClick");
        expect(div).not.toHaveProperty("ref");
        expect(div).not.toHaveProperty("prop:lang");
        expect(div).not.toHaveProperty("data-ref");
      }
      expect(serverAttributes(html, "dynamic-div")["data-attrs"]).toBe("yes");
      // a component target that spreads its props must not receive an empty
      // style for a dynamic component without style values
      const spread = serverAttributes(html, "spread-target");
      expect(html).not.toMatch(/data-testid="spread-target"[^>]*style=""/);
      expect(spread).not.toHaveProperty("$green");
      expect(spread).not.toHaveProperty("style");
      // innerHTML won over the unread textContent getter (which throws on the server)
      for (const id of ["unread-div", "unread-a"]) {
        expect(html).toMatch(
          new RegExp(
            `<(?:div|a)\\b(?:[^>"]|"[^"]*")*data-testid="${id}"(?:[^>"]|"[^"]*")*><b>raw</b></(?:div|a)>`,
          ),
        );
      }
    }

    await page.goto(testEnv.url);
    for (const pair of ["static", "dynamic"]) {
      const div = page.getByTestId(`${pair}-div`);
      const anchor = page.getByTestId(`${pair}-a`);
      // the refs run during hydration, so their attribute marks the dom as ready
      await expect(div).toHaveAttribute("data-ref", "1");
      await expect(anchor).toHaveAttribute("data-ref", "1");
      expect(await domAttributes(page, `${pair}-a`)).toEqual(
        await domAttributes(page, `${pair}-div`),
      );
      for (const element of [div, anchor]) {
        await expect(element).toHaveText("text");
        await expect(element).toHaveAttribute("data-on");
        await expect(element).toHaveAttribute("data-empty", "");
        await expect(element).toHaveAttribute("data-num", "0");
        await expect(element).toHaveAttribute("data-text", 'a&b"c<d>');
        await expect(element).toHaveAttribute("title", "t");
        await expect(element).toHaveAttribute("lang", "de");
        await expect(element).toHaveAttribute("data-ref", "1");
        await expect(element).not.toHaveAttribute("data-none");
        await expect(element).not.toHaveAttribute("hidden");
        await expect(element).toHaveClass(/\buser\b/);
        await expect(element).toHaveClass(/\bactive\b/);
        await expect(element).not.toHaveClass(/\boff\b/);
        await expect(element).toHaveCSS("padding-top", "1px");
        await expect(element).toHaveCSS("margin-top", "4px");
        await expect(element).toHaveCSS("background-color", "rgb(1, 2, 3)");
        await expect(element).toHaveCSS(
          "color",
          pair === "dynamic" ? "rgb(255, 0, 0)" : "rgb(0, 0, 0)",
        );
      }
      if (pair === "dynamic") {
        await expect(div).toHaveAttribute("data-attrs", "yes");
        await expect(anchor).toHaveAttribute("data-attrs", "yes");
      }
    }
    for (const id of ["unread-div", "unread-a"]) {
      await expect(page.getByTestId(id).locator("b")).toHaveText("raw");
    }
    await expect(page.getByTestId("spread-target")).toHaveCSS("color", "rgb(0, 128, 0)");
    await expect(page.getByTestId("spread-target")).not.toHaveAttribute("$green");
    // style content is raw on the server (the react vite app renders on the client) and applies
    if (testEnv.framework === "solid") {
      const rawHtml = await (await page.request.get(testEnv.url)).text();
      expect(rawHtml).toContain('content: "<&"');
    }
    expect(
      await page
        .getByTestId("raw-target")
        .evaluate((el) => getComputedStyle(el, "::before").content),
    ).toBe('"<&"');
  }),
);
