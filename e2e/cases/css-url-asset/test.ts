import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

/** Reproduces https://github.com/DigitecGalaxus/next-yak/issues/513 */
test(
  "loads asset referenced via CSS url()",
  withTestEnv("css-url-asset", async (fsTmp, page) => {
    await page.goto(fsTmp.url);
    const box = page.getByTestId("image-box");

    const contentType = await box.evaluate(async (boxElement) => {
      const url = getComputedStyle(boxElement).backgroundImage.match(/url\("(.+?)"\)/)?.[1];
      const request = url ? await fetch(url) : null;
      return request?.headers.get("content-type") ?? "none";
    });
    
    // Verify that the content type indicates an image (as some bundlers always serve a SPA fallback HTML file on 404)
    expect(contentType).toContain("image/");
  }),
);
