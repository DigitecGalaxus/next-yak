import { test, expect } from "@playwright/test";
import { withTestEnv } from "yak-e2e";

// a relative url() in yak css must load the image, both from the file that
// defines the style and from a mixin inlined into a file in another directory
test(
  "loads assets referenced with a relative CSS url()",
  withTestEnv("css-url-asset", async (testEnv, page) => {
    await page.goto(testEnv.url);
    for (const testId of ["same-file", "cross-file-mixin"]) {
      const contentType = await page.getByTestId(testId).evaluate(async (box) => {
        const url = /url\("(.+?)"\)/.exec(getComputedStyle(box).backgroundImage)?.[1];
        const response = url ? await fetch(url) : null;
        return response?.headers.get("content-type") ?? "no url";
      });
      // some dev servers answer a missing file with their HTML page, so the
      // status alone does not prove the image loaded
      expect(contentType, testId).toContain("image/");
    }
  }),
);
