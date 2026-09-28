import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { get } from "node:http";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { withTestEnv } from "next-yak-e2e";

// URL clients can remove ../ segments before sending the request.
function requestPath(origin: string, path: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    get(origin, { path }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => (body += chunk));
      response.on("end", () => resolve({ status: response.statusCode!, body }));
      response.on("error", reject);
    }).on("error", reject);
  });
}

test(
  "does not expose denied files through virtual CSS requests",
  withTestEnv("security-virtual-css", async (testEnv, page) => {
    test.skip(
      !["vite", "vite-solid", "vinext-pages"].includes(testEnv.bundlerDirName),
      "The virtual CSS endpoint belongs to the Vite plugin.",
    );

    await page.goto(testEnv.url);
    await expect(page.getByTestId("box")).toHaveCSS("color", "rgb(255, 0, 0)");
    testEnv.expectConsoleErrors("Denied virtual CSS requests trigger Vite's error overlay.");

    const secret = `YAK_PRIVATE_${randomUUID()}`;
    const fixtures = await mkdtemp(join(testEnv.cwd, "private-"));
    const outside = await mkdtemp(join(tmpdir(), "yak-vite-denied-"));
    try {
      const file = join(fixtures, ".env");
      await writeFile(file, `SECRET=https://${secret}\n`);
      const outsideFile = join(outside, "private.txt");
      await writeFile(outsideFile, `SECRET=https://${secret}\n`);
      const yakPackage = testEnv.framework === "solid" ? "@yak/solid" : "next-yak";
      const sources = [file, outsideFile];
      for (const extension of ["ts", "yak.ts"]) {
        await writeFile(
          join(fixtures, `.env.${extension}`),
          extension === "yak.ts"
            ? `throw new Error("${secret}"); export const color = "red";`
            : `export const color = "${secret}";`,
        );
        const importer = join(fixtures, `import-${extension}.tsx`);
        await writeFile(
          importer,
          `import { styled } from "${yakPackage}";
import { color } from "./.env.${extension}";
export const Box = styled.div\`color: \${color};\`;`,
        );
        sources.push(importer);
      }
      for (const source of sources) {
        for (const path of [source, relative(resolve(testEnv.cwd, "../.."), source)]) {
          const response = await requestPath(
            page.url(),
            `/@id/__x00__virtual:yak-css:${encodeURI(path.replaceAll("\\", "/"))}.css?direct`,
          );
          expect(response.status).toBeGreaterThanOrEqual(400);
          expect(response.body).not.toContain(secret);
        }
      }
      for (const id of [".css", "cases/security-virtual-css/index.tsxXXXX?direct"]) {
        const response = await page.request.get(`/@id/__x00__virtual:yak-css:${id}`);
        expect(response.status()).toBeGreaterThanOrEqual(400);
      }
    } finally {
      await rm(fixtures, { recursive: true, force: true });
      await rm(outside, { recursive: true, force: true });
    }
  }),
);
