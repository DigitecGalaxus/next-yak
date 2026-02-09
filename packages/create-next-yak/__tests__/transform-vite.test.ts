import { describe, it, expect } from "vitest";
import { transformViteConfig } from "../src/transform-vite.ts";

describe("transformViteConfig", () => {
  it("adds viteYak to defineConfig with no plugins", () => {
    const input = `import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
  },
});
`;
    const result = transformViteConfig(input);
    expect(result).toContain("next-yak/vite");
    expect(result).toContain("viteYak()");
  });

  it("adds viteYak alongside existing plugins", () => {
    const input = `import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
});
`;
    const result = transformViteConfig(input);
    expect(result).toContain("next-yak/vite");
    expect(result).toContain("viteYak()");
    expect(result).toContain("react()");
  });

  it("handles bare object export", () => {
    const input = `export default {
  build: {
    outDir: "dist",
  },
};
`;
    const result = transformViteConfig(input);
    expect(result).toContain("next-yak/vite");
    expect(result).toContain("viteYak()");
  });
});
